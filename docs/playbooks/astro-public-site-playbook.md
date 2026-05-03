# Playbook — Site Público em Astro (estratégia replicável)

> **Objetivo deste documento:** servir como prompt/blueprint para replicar a estratégia
> que usamos no AUMAF 3D em outro projeto que também terá **site público em Astro** e
> **backoffice em outra stack** (React/Vite, Next, Vue, etc.). É um guia opinativo —
> as decisões aqui resolveram problemas reais e devem ser preservadas até que haja
> motivo concreto para mudá-las.

---

## 0. Filosofia / Quando usar essa arquitetura

Essa estratégia se aplica quando o projeto tem **dois públicos com necessidades opostas**:

| Frente | Público | Prioridade | Stack |
|---|---|---|---|
| **Site público** | Visitantes/buscadores/LLMs | SEO, GEO, performance, A11y, conteúdo | **Astro 5 (SSG)** |
| **Backoffice/admin** | Usuários autenticados | DX, formulários complexos, tempo real, autorização | React/Vite (ou outra SPA) |

A separação é deliberada: SPAs são pesadas demais para landing pages e blogs (custam SEO e
LCP); SSGs são limitados demais para CRUDs autenticados. **Astro resolve só metade do
problema** — não tente fazer ele virar um admin.

**Regra de ouro:** o site público nunca depende do backoffice em runtime. Conteúdo do blog
é puxado **em build time** ou via fetch público com cache. Se o backoffice cair, o site
continua online.

---

## 1. Stack do site público

```jsonc
// frontend-public/package.json (essencial)
{
  "type": "module",
  "scripts": {
    "dev": "astro dev --port 4321",
    "build": "astro build",
    "preview": "astro preview",
    "typecheck": "astro check"
  },
  "dependencies": {
    "@astrojs/sitemap": "^3.0.0",
    "@astrojs/tailwind": "^6.0.0",
    "astro": "^5.0.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.9",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.9.3"
  }
}
```

**Stack mínima e justificada:**
- **Astro 5** — output `static`, file-based routing, hidratação seletiva, zero JS no caminho crítico por padrão.
- **Tailwind CSS** — design tokens centralizados em `tailwind.config.ts`; `applyBaseStyles: false` para que o CSS global tenha controle total da camada `base`.
- **`@astrojs/sitemap`** — sitemap automático com prioridades customizadas.
- **TypeScript** + `astro check` para typecheck.
- **Zero framework JS por padrão** (sem React/Vue na bundle pública). Adicione um framework
  só quando uma ilha realmente precisar (ex.: editor TipTap → use no admin, não aqui).

**O que NÃO entra:**
- React/Vue/Svelte global — encarece a bundle e enfraquece SEO.
- CMS pesado em build (Contentful, Sanity) na primeira fase — comece com markdown/JSON local; suba para CMS quando o conteúdo justificar.
- Bibliotecas de animação JS (Framer Motion, GSAP) — use CSS keyframes (Tailwind suporta em `theme.extend.keyframes`).

---

## 2. Estrutura de pastas

```
frontend-public/
├── astro.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   ├── fonts/                    # fontes locais (.otf/.woff2) — preload no <head>
│   ├── og/                       # imagens Open Graph (1200x630)
│   ├── favicon.svg
│   ├── apple-touch-icon.svg
│   ├── site.webmanifest
│   └── robots.txt
└── src/
    ├── pages/                    # rotas file-based (.astro)
    │   ├── index.astro
    │   ├── 404.astro
    │   ├── [outras-rotas].astro
    │   └── blog/
    │       ├── index.astro
    │       └── [slug].astro
    ├── layouts/
    │   └── Base.astro            # layout único, recebe schemas + breadcrumb por props
    ├── components/
    │   ├── SEO.astro             # head: meta + OG + Twitter + JSON-LD @graph
    │   ├── Navbar.astro          # header fixo + drawer mobile
    │   ├── Footer.astro
    │   └── Breadcrumb.astro
    ├── lib/
    │   ├── company.ts            # NAP — single source of truth institucional
    │   └── schemas.ts            # geradores de JSON-LD (Organization, LocalBusiness, ...)
    └── styles/
        └── global.css            # @tailwind + componentes utilitários (glass, glow, etc.)
```

**Princípios:**
- **`lib/company.ts` é a única fonte de verdade** sobre NAP (Name/Address/Phone), redes
  sociais, horários e descrição institucional. Toda menção do site deriva daqui — sem
  isso, SEO local e GEO ficam inconsistentes.
- **`lib/schemas.ts`** exporta funções puras que retornam objetos JSON-LD. O `SEO.astro`
  monta o `@graph` final.
- **`components/`** só contém o que é reutilizado em ≥2 páginas. Hero específico de uma
  página fica inline no `.astro` da página.
- **`pages/v2/`** (ou similar) — diretório de experimentos/staging que **deve ser
  excluído do sitemap** via filter (ver `astro.config.ts`).

---

## 3. `astro.config.ts` — decisões obrigatórias

```ts
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://SEU_DOMINIO.com.br',   // obrigatório p/ canonical, sitemap, OG
  output: 'static',                      // SSG total — zero servidor
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',           // inlina CSS pequeno → reduz round-trip
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',            // pré-fetch só ao passar o mouse — economiza dados
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes('/v2/'),  // exclui rascunhos
      serialize(item) {
        // Prioridades por tipo de página — guia o crawler
        if (item.url.endsWith('/')) return { ...item, priority: 1.0 }
        if (item.url.includes('/contato')) return { ...item, priority: 0.9 }
        if (item.url.includes('/blog/')) return { ...item, priority: 0.85 }
        return item
      },
    }),
  ],
  vite: {
    build: { cssMinify: 'lightningcss' },  // minificador mais rápido e agressivo
  },
})
```

**Por quê cada peça:**
- `output: 'static'` — Vercel/Netlify/Cloudflare Pages servem estático com latência ~zero.
  Se um dia precisar de SSR pontual, prefira islands com `client:visible` antes de mudar pra `hybrid`.
- `prefetch.defaultStrategy: 'hover'` — `viewport` consome dados de mobile sem necessidade;
  `tap` é tarde demais. `hover` é o sweet spot.
- `filter` no sitemap — staging routes (`/v2/`, `/preview/`) jamais devem ser indexadas.
- `serialize` — Google interpreta `priority` como dica relativa. Use 1.0 só para a home.

---

## 4. Sistema de design — tokens em `tailwind.config.ts`

A regra é: **todo valor visual repetido vira token**. Cores hex soltas no JSX são bug.

```ts
// tailwind.config.ts (essencial)
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: {
          DEFAULT: '#131313', dim: '#0e0e0e', low: '#1c1b1b',
          base: '#201f1f', high: '#2a2a2a', highest: '#353534',
          variant: '#353534',
        },
        primary: {
          DEFAULT: '#7ce268', container: '#61c54f',
          dim: '#78dd64', fixed: '#93fa7d',
        },
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#becab6',
        'on-primary': '#013a00',
        outline: '#899482',
        'outline-variant': '#3f4a3b',
        error: '#ffb4ab',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      fontSize: {
        // Tipografia fluida com clamp() — escalas sem media query
        'display-xl': ['clamp(48px,6vw,72px)', { lineHeight: '1.0', letterSpacing: '-0.04em' }],
        'headline-lg': ['clamp(28px,3vw,40px)', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'body-lg': ['18px', { lineHeight: '1.6' }],
        'body-md': ['16px', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'label-caps': ['11px', { lineHeight: '1.0', letterSpacing: '0.2em' }],
        'code-data': ['13px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      spacing: {
        margin: '64px', 'margin-sm': '24px', gutter: '24px',
        'section-gap': '160px', 'section-gap-sm': '80px',
        'stack-xl': '96px', 'stack-lg': '48px', 'stack-md': '24px', 'stack-sm': '8px',
      },
      borderRadius: { DEFAULT: '2px', sm: '1px', md: '4px', lg: '8px', full: '9999px' },
      boxShadow: {
        glow: '0 0 15px rgba(97, 197, 79, 0.3)',
        'glow-lg': '0 0 30px rgba(97, 197, 79, 0.4)',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease forwards',
        'pulse-dot': 'pulseDot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // ... defina todos os keyframes correspondentes em `keyframes`
      },
    },
  },
}
```

**Convenções (Material 3 inspired, dark-first):**
- **Hierarquia de superfície:** `background` (preto puro) → `surface.dim/DEFAULT/low/.../highest`. Sempre escolher pela posição (mais alto = mais elevado), nunca por hex.
- **`on-X` define o que vai EM CIMA de X.** Texto sobre `surface` é `on-surface`. Texto
  sobre `primary` é `on-primary`. Isso evita decidir contraste no JSX.
- **Tipografia fluida** com `clamp()` — uma única escala cobre mobile→4K sem media queries.
- **`label-caps` / `code-data`** — escalas micro com `letter-spacing` largo dão personalidade técnica e são ótimas para selos, status, métricas.
- **Spacing por intent** — `section-gap` (entre seções), `stack-*` (vertical interno), `gutter` (horizontal). Evita o "use 16px porque sim".

---

## 5. CSS global — `src/styles/global.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

@font-face {
  font-family: 'Pirulen';                /* fonte de marca local */
  src: url('/fonts/pirulen.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;                    /* nunca FOIT, sempre FOUT */
}

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }

  body {
    @apply bg-background text-on-surface antialiased;
    font-family: 'Space Grotesk', sans-serif;
    overflow-x: clip;     /* CRÍTICO: clip não cria BFC, position:sticky continua funcionando.
                             overflow-x:hidden quebra sticky em browsers WebKit. */
  }

  :focus-visible {
    outline: 2px solid #61c54f;          /* contraste >=3:1 sobre fundo preto */
    outline-offset: 2px;
    border-radius: 2px;
  }

  ::selection { @apply bg-primary-container text-on-primary; }
}

@layer components {
  /* Glassmorphism — usado em navbar e cards */
  .glass-panel {
    background: rgba(42, 42, 42, 0.4);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .nav-glass {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(48px);
    -webkit-backdrop-filter: blur(48px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .glow-effect { box-shadow: 0 0 15px rgba(97, 197, 79, 0.35); }
}
```

**Armadilhas que custaram horas:**
1. **`overflow-x: hidden` no `<body>` quebra `position: sticky`** em Safari. Use `overflow-x: clip`. (Aprendi do jeito difícil — navbar "sumindo" no scroll.)
2. **Fonte local sempre `font-display: swap`** + `<link rel="preload">` no head, senão o LCP é a fonte e cai 20+ pontos no Lighthouse.
3. **`:focus-visible` global obrigatório** com contraste ≥3:1 sobre cada superfície usada. Auditoria de A11y reprova sem isso.

---

## 6. Layout base — `src/layouts/Base.astro`

Único layout do site. Recebe SEO/breadcrumb/schemas via props para que cada página
declare apenas o que é específico dela.

**Responsabilidades do `<head>`:**
- `lang="pt-BR"` no `<html>`, `class="dark"` se dark-only.
- Meta básica + theme-color + apple-touch-icon + manifest + format-detection.
- **Preload da fonte local** (`<link rel="preload" as="font" crossorigin>`) — LCP.
- **DNS-prefetch + preconnect** para Google Fonts.
- Chama `<SEO />` que monta meta tags + JSON-LD.

**Responsabilidades do `<body>`:**
- **Skip link** (`sr-only focus:not-sr-only`) — primeiro elemento, pula para `#main-content`.
- `<main id="main-content" tabindex="-1">` — alvo do skip link e foco programático após navegação.
- **FAB "voltar ao topo"** (botão fixed, aparece após scrollY > 400, smooth scroll). Só JS vanilla, ~30 linhas.

```astro
---
import '../styles/global.css'
import SEO from '../components/SEO.astro'

export interface Props {
  title: string
  description?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
  schemas?: object[]                    // FAQPage, BlogPosting, HowTo, ItemList, Service...
  breadcrumb?: { name: string; url: string }[]
  pageType?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'FAQPage'
}
const { title, description, ogImage, ogType, noindex, schemas, breadcrumb, pageType } = Astro.props
---
<!doctype html>
<html lang="pt-BR" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="color-scheme" content="dark" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preload" href="/fonts/SUA_FONTE.otf" as="font" type="font/otf" crossorigin />
    <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <SEO {title} {description} {ogImage} {ogType} {noindex} {schemas} {breadcrumb} {pageType} />
  </head>
  <body class="bg-background text-on-surface antialiased">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-surface-high focus:text-primary-container focus:rounded">
      Pular para o conteúdo
    </a>
    <main id="main-content" tabindex="-1" class="outline-none">
      <slot />
    </main>
    <!-- FAB voltar ao topo aqui -->
  </body>
</html>
```

---

## 7. SEO — `src/components/SEO.astro` + `src/lib/schemas.ts`

A estratégia inteira gira em torno de **um único `@graph` JSON-LD por página** que sempre
inclui `Organization`, `LocalBusiness`, `WebSite` e `WebPage`, e adiciona schemas específicos
da página (FAQPage, BlogPosting, ItemList, etc.) via prop.

### 7.1 Single source of truth — `src/lib/company.ts`

```ts
export const COMPANY = {
  name: 'NOME COMERCIAL',
  legalName: 'RAZÃO SOCIAL',
  url: 'https://SEU_DOMINIO.com.br',
  logo: 'https://SEU_DOMINIO.com.br/logo.png',
  ogImageDefault: 'https://SEU_DOMINIO.com.br/og/og-default.svg',
  founded: '2022',
  description: 'Descrição em 1 frase com palavra-chave principal + cidade/UF.',
  shortPitch: 'Pitch curto para hero/OG.',
  address: {
    streetAddress: 'Rua X, 123',
    neighborhood: 'Bairro',
    addressLocality: 'Cidade',
    addressRegion: 'UF',
    postalCode: '00000-000',
    addressCountry: 'BR',
  },
  geo: { latitude: -00.0000, longitude: -00.0000 },
  contact: {
    phone: '+55XXXXXXXXXXX',
    phoneDisplay: '(XX) XXXXX-XXXX',
    whatsapp: 'https://wa.me/55XXXXXXXXXXX',
    email: 'contato@dominio.com.br',
  },
  hours: {
    open: '08:00', close: '18:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const,
    displayPt: 'Segunda – Sexta, 08h–18h',
  },
  socials: {
    instagram: 'https://instagram.com/...',
    linkedin: 'https://linkedin.com/company/...',
    facebook: 'https://facebook.com/...',
  },
  serviceAreaCountry: 'BR',
  industries: [/* ... */],
} as const

export type Company = typeof COMPANY
```

**Por que isso importa:** SEO local + GEO (otimização para LLMs) exige que a NAP apareça
**idêntica** em (1) JSON-LD `LocalBusiness`, (2) microdata visível no rodapé, (3) página
de contato, (4) Google Business Profile. Variações sutis ("Av." vs "Avenida") são tratadas
como entidades diferentes.

### 7.2 Geradores de schema — `src/lib/schemas.ts`

```ts
import { COMPANY } from './company'

const ORG_ID = `${COMPANY.url}/#org`
const LOCAL_ID = `${COMPANY.url}/#local`
const SITE_ID = `${COMPANY.url}/#site`

export function organizationSchema() { /* @type Organization, @id ORG_ID, ... */ }
export function localBusinessSchema() { /* @type LocalBusiness, address, geo, hours, parentOrganization: ORG_ID */ }
export function webSiteSchema() { /* @type WebSite, publisher: ORG_ID */ }
export function webPageSchema({ url, name, description, type }) { /* isPartOf: SITE_ID, publisher: ORG_ID */ }
export function breadcrumbSchema(items) { /* BreadcrumbList */ }
export function faqPageSchema(faqs) { /* FAQPage */ }
export function articleSchema({ ... }) { /* BlogPosting/Article */ }
export function serviceSchema({ ... }) { /* Service */ }
export function itemListSchema({ ... }) { /* ItemList — útil para listings */ }

// Agregador final — sempre exportar isso
export function graphPayload(items: object[]) {
  return { '@context': 'https://schema.org', '@graph': items }
}
```

**Decisão chave:** usar `@id` estáveis (`/#org`, `/#site`, `/#local`) e referenciar via
`{ '@id': ... }` em vez de duplicar o objeto. Isso reduz o JSON-LD em ~60% e é o padrão
correto para o Google Knowledge Graph.

### 7.3 `SEO.astro` — head completo

```astro
---
import { COMPANY } from '../lib/company'
import { organizationSchema, localBusinessSchema, webSiteSchema, webPageSchema, breadcrumbSchema, graphPayload } from '../lib/schemas'

const { title, description = COMPANY.description, ogImage = COMPANY.ogImageDefault,
  ogType = 'website', noindex = false, schemas = [], breadcrumb = [], pageType = 'WebPage', article } = Astro.props

const canonical = new URL(Astro.url.pathname, Astro.site).toString()
const fullTitle = title.includes(COMPANY.name) ? title : `${title} | ${COMPANY.name}`

const baseGraph = [
  organizationSchema(),
  localBusinessSchema(),
  webSiteSchema(),
  webPageSchema({ url: canonical, name: fullTitle, description, type: pageType }),
]
if (breadcrumb.length > 0) {
  baseGraph.push(breadcrumbSchema([
    { name: 'Home', url: COMPANY.url + '/' },
    ...breadcrumb.map(b => ({ name: b.name, url: b.url.startsWith('http') ? b.url : COMPANY.url + b.url })),
  ]))
}
const graph = graphPayload([...baseGraph, ...schemas])
---
<title>{fullTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
{noindex
  ? <meta name="robots" content="noindex, nofollow" />
  : <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}

<!-- Open Graph -->
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content={ogType} />
<meta property="og:locale" content="pt_BR" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={fullTitle} />
<meta name="twitter:image" content={ogImage} />

<!-- JSON-LD @graph -->
<script type="application/ld+json" set:html={JSON.stringify(graph)} />
```

**Cobertura por tipo de página:**
| Página | `pageType` prop | `schemas` extras |
|---|---|---|
| Home | `WebPage` | `ItemList` (serviços), `Service` (×N) |
| Contato | `ContactPage` | — |
| Sobre | `AboutPage` | — |
| FAQ | `FAQPage` | `faqPageSchema(faqs)` |
| Blog index | `CollectionPage` | `ItemList` (posts) |
| Post | `WebPage` (ogType `article`) | `articleSchema({ ... })` (BlogPosting) |
| Portfolio | `CollectionPage` | `ItemList` (cases) |

---

## 8. GEO — otimização para LLMs

Diferente de SEO clássico, GEO (Generative Engine Optimization) é "como o ChatGPT/Perplexity
te citam quando alguém pergunta sobre seu nicho". Princípios:

1. **Prosa explicativa, não bullets soltos.** LLMs extraem frases inteiras. Cada parágrafo
   deve responder uma pergunta implícita.
2. **Resposta antes da explicação** (estilo featured snippet). H2 = pergunta, primeiro
   parágrafo = resposta direta em 2-3 frases.
3. **Entidades nomeadas explícitas** — diga "AUMAF 3D, em São Carlos – SP", não "nós, aqui na cidade". LLMs precisam de âncoras.
4. **Schema.org rico** — `LocalBusiness` + `FAQPage` + `Service` com `areaServed` ajudam
   modelos a descobrir os fatos estruturados.
5. **`pt-BR` em `<html lang>` e `inLanguage` em todos os schemas** — modelos multilíngues
   roteiam por idioma.
6. **NAP consistente** (ver §7.1) — divergências = entidade ambígua.

---

## 9. Acessibilidade — WCAG 2.2 AA

Checklist obrigatório (testado com axe-core + leitor de tela manual):

- [x] `lang="pt-BR"` no `<html>`.
- [x] **Skip link** como primeiro elemento focalizável do `<body>` (`sr-only focus:not-sr-only`).
- [x] `<main id="main-content" tabindex="-1">` para receber foco programático.
- [x] **`:focus-visible` global** com contraste ≥3:1 sobre todos os fundos.
- [x] Todo `<button>` interativo com `aria-label` se ícone-only.
- [x] Toggle hamburger: `aria-expanded`, `aria-controls`, `aria-label` que muda ("Abrir/Fechar menu").
- [x] **Drawer mobile** = `role="dialog" aria-modal="true"`, com **focus trap** (Tab cicla dentro), **Esc fecha**, foco volta ao botão de origem ao fechar, `body { overflow: hidden }` enquanto aberto.
- [x] Links de navegação com `aria-current="page"` no item ativo.
- [x] Imagens decorativas com `alt=""` e `aria-hidden="true"`; ícones decorativos com `aria-hidden="true"`.
- [x] Breadcrumb em `<nav aria-label="Trilha de navegação">` com `<ol>`, último item com `aria-current="page"` (não link).
- [x] Footer headings com `<h2 id="footer-heading" class="sr-only">` + `<footer aria-labelledby>`.
- [x] Touch targets ≥44×44 px (botões mobile, FAB).
- [x] Contraste de texto ≥4.5:1 para normal, ≥3:1 para large.
- [x] Animações respeitam `prefers-reduced-motion` (adicionar media query no global.css se houver muita animação).

**Anti-padrões a evitar:**
- `outline: none` sem fallback `:focus-visible`.
- `<div onClick>` em vez de `<button>`.
- `placeholder` como única label de input — sempre ter `<label>` (pode ser `sr-only`).

---

## 10. Performance — alvos e como atingir

**Alvos Lighthouse:**
- Performance ≥95 (mobile)
- LCP < 1.5s
- CLS < 0.05
- TTI < 2s

**Como:**
1. **SSG (`output: 'static'`)** — HTML pronto, zero TTFB de renderização.
2. **Sem JS framework por padrão** — só vanilla onde precisar (drawer, FAB, tabs).
   Hidratação só com `client:load`/`client:visible`/`client:idle` quando inevitável.
3. **`<Image>` do Astro** para tudo que vem de `src/assets/` — gera AVIF/WebP automaticamente.
   Para imagens em `public/`, especifique `width`/`height` para evitar CLS.
4. **Preload da fonte local** + `font-display: swap`.
5. **CSS minificado com `lightningcss`** + `inlineStylesheets: 'auto'`.
6. **`prefetch.defaultStrategy: 'hover'`**.
7. **Sem CSS-in-JS** — Tailwind compila pra utilitários estáticos.
8. **Imagens OG SVG quando possível** (1200×630) — kilobytes em vez de megabytes.

---

## 11. Padrões de página

Todo `.astro` de página segue este esqueleto:

```astro
---
import Base from '../layouts/Base.astro'
import Navbar from '../components/Navbar.astro'
import Footer from '../components/Footer.astro'
import Breadcrumb from '../components/Breadcrumb.astro'
import { faqPageSchema /*, ... */ } from '../lib/schemas'

const faqs = [/* ... */]
const pageSchemas = [faqPageSchema(faqs)]
---
<Base
  title="Título com palavra-chave principal"
  description="Descrição 150-160 chars com cidade/UF e proposta de valor."
  pageType="FAQPage"
  schemas={pageSchemas}
  breadcrumb={[{ name: 'FAQ' }]}
>
  <Navbar currentPath={Astro.url.pathname} />

  <section class="pt-24 pb-section">
    <div class="max-w-5xl mx-auto px-edge">
      <Breadcrumb items={[{ name: 'FAQ' }]} />
      <h1 class="text-display-lg">...</h1>
      <!-- conteúdo -->
    </div>
  </section>

  <Footer />
</Base>
```

**Containers padronizados:**
- Páginas de leitura (FAQ, Blog post, Sobre): `max-w-5xl` (medida ótima de leitura).
- Listings (Portfolio, Blog index, Materiais): `max-w-7xl` ou `max-w-[1600px]`.
- Hero/full bleed: sem `max-w`, controle pela seção.
- **Padding edge:** `px-edge` (utility custom no global.css que casa com gutter dos tokens) ou `px-6 lg:px-12`.

---

## 12. Integração com o backoffice

O site público **lê** conteúdo gerenciado pelo backoffice (posts de blog, casos de portfolio).
Estratégia recomendada:

### Opção A — Build-time fetch (preferida na fase 1)
```astro
---
// pages/blog/index.astro
const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/v1/posts?status=published`)
const { posts } = await res.json()
---
```
- Pros: zero runtime JS, cache HTTP, sitemap dinâmico.
- Cons: precisa rebuild para publicar (resolva com webhook do CMS → trigger deploy Vercel).

### Opção B — ISR/SSR pontual (quando volume justifica)
- Mude `output: 'hybrid'`.
- Marque só `pages/blog/[slug].astro` com `export const prerender = false`.
- Use `Cache-Control: s-maxage=300, stale-while-revalidate=86400`.

### Contrato API (sugestão — adapte ao backoffice real):
```
GET /v1/posts?status=published&page=1
GET /v1/posts/:slug
GET /v1/categories
```

**Auth/segurança:**
- Backoffice usa **JWT em cookie httpOnly** (nunca localStorage).
- Endpoints **públicos** (`/v1/posts?status=published`) não precisam de auth.
- Endpoints **admin** (`/v1/admin/*`) ficam atrás de middleware `requireAuth`.

**Pacote compartilhado:**
- Crie `packages/shared` com **Zod schemas** dos contratos. Tanto backend quanto site público
  validam contra os mesmos schemas — type-safety end-to-end.

---

## 13. Pipeline de qualidade

### Local
```bash
npm run dev          # astro dev — porta 4321
npm run build        # astro build → dist/
npm run preview      # preview do build
npm run typecheck    # astro check (TypeScript + .astro)
```

### CI (GitHub Actions / Vercel checks)
1. `npm ci`
2. `npm run typecheck` — falha em qualquer erro TS.
3. `npm run build` — falha em qualquer warning de Astro relevante.
4. **Lighthouse CI** sobre URLs-chave (`/`, `/contato`, `/blog/<post>`):
   - Performance ≥90, A11y ≥95, SEO ≥95, Best Practices ≥95.
5. **`pa11y-ci`** ou **axe-core** para A11y automatizada nas mesmas URLs.
6. **Validação JSON-LD** (Schema Markup Validator → script CLI).
7. **Verificação de links quebrados** (linkinator).

### Pré-deploy manual
- [ ] Testar em viewport 320px (iPhone SE).
- [ ] Navegar inteiro só com teclado (Tab, Shift+Tab, Enter, Esc).
- [ ] Ler com VoiceOver/NVDA pelo menos a home.
- [ ] Conferir OG image em https://www.opengraph.xyz/.
- [ ] Conferir JSON-LD em https://validator.schema.org/.
- [ ] Sitemap acessível em `/sitemap-index.xml`.
- [ ] `robots.txt` linkando o sitemap.

---

## 14. Checklist de replicação para o próximo projeto

Quando começar o novo projeto, execute nesta ordem:

1. [ ] `npm create astro@latest frontend-public -- --template minimal --typescript strict`
2. [ ] Adicionar integrations: `npx astro add tailwind sitemap`
3. [ ] Configurar `astro.config.ts` com `site`, `output: 'static'`, `prefetch`, sitemap filter+serialize.
4. [ ] Copiar e adaptar `tailwind.config.ts` (paleta + tipografia + spacing + animations).
5. [ ] Criar `src/lib/company.ts` com NAP completo (preencha tudo, sem placeholders).
6. [ ] Criar `src/lib/schemas.ts` com geradores `organization/localBusiness/webSite/webPage/breadcrumb/faqPage/article/itemList/service/graphPayload`.
7. [ ] Criar `src/components/SEO.astro` (head meta + OG + Twitter + JSON-LD @graph).
8. [ ] Criar `src/layouts/Base.astro` com skip link + `<main tabindex=-1>` + FAB.
9. [ ] Criar `src/components/Navbar.astro` (fixed top, drawer mobile com focus trap, `aria-current`).
10. [ ] Criar `src/components/Footer.astro` (NAP visível derivada de `COMPANY`).
11. [ ] Criar `src/components/Breadcrumb.astro` (`<nav aria-label>` + `<ol>` + `aria-current`).
12. [ ] Criar `src/styles/global.css` com `@font-face` local + `:focus-visible` + glassmorphism + `overflow-x: clip` no body.
13. [ ] Adicionar fontes locais a `public/fonts/` + preload no Base.astro.
14. [ ] Criar `public/og/og-default.svg` (1200×630).
15. [ ] Criar `public/robots.txt` apontando para sitemap.
16. [ ] Criar `public/site.webmanifest` + favicons.
17. [ ] Implementar páginas seguindo o esqueleto de §11 (uma por uma, com schemas apropriados).
18. [ ] Configurar Lighthouse CI + axe + Schema validator no CI.
19. [ ] Definir contrato API com o backoffice (Zod schemas em `packages/shared`).
20. [ ] Configurar webhook do backoffice → trigger redeploy quando posts publicarem.

---

## 15. Decisões a NÃO tomar de novo (anti-padrões aprendidos)

| Anti-padrão | Por que dói | Faça |
|---|---|---|
| `overflow-x: hidden` no body | Quebra `position: sticky` no Safari | `overflow-x: clip` |
| Hex hardcoded no markup | Inconsistência inevitável | Tokens no `tailwind.config.ts` |
| NAP duplicado em strings | SEO local e GEO inconsistentes | `lib/company.ts` único |
| JSON-LD sem `@id` estáveis | Google Knowledge Graph não conecta entidades | `@id` com fragment (`/#org`) + `{ '@id': ... }` |
| Drawer mobile sem focus trap | Reprovação WCAG 2.2 + UX teclado quebrada | Trap + Esc + restore focus |
| `localStorage` p/ JWT | XSS = roubo de sessão | Cookie httpOnly + SameSite=Lax |
| Fonte sem `font-display: swap` | LCP catastrófico | `swap` + preload |
| React global no site público | Bundle de 50kb+ no caminho crítico | Astro puro; islands só onde precisa |
| Sitemap incluindo `/v2/`, `/preview/` | Indexação de rascunhos | `filter` no sitemap config |
| `placeholder` como label | A11y reprovado, contraste falha | `<label sr-only>` + `placeholder` opcional |

---

## 16. Prompt-template para iniciar o próximo projeto

> Você é um engenheiro frontend sênior. Vou construir o site público do projeto **[NOME]**
> seguindo a estratégia documentada em `astro-public-site-playbook.md`.
>
> **Stack obrigatória:**
> - Astro 5 (`output: 'static'`, integrations: tailwind + sitemap)
> - Tailwind CSS 3.4 com tokens centralizados em `tailwind.config.ts` (não use o tema padrão)
> - TypeScript strict + `astro check`
> - Zero framework JS — só islands com `client:visible` quando inevitável
>
> **Identidade do negócio:**
> - Nome: [...]
> - Domínio: [...]
> - Endereço completo (NAP): [...]
> - Telefone/WhatsApp/Email: [...]
> - Horário: [...]
> - Redes sociais: [...]
> - Setores atendidos: [...]
> - Pitch curto (≤ 160 chars): [...]
>
> **Identidade visual:**
> - Tema: dark-first | light-first | dual
> - Cor primária: #...
> - Cor de superfície base: #...
> - Tipografia display: [Google Font ou local]
> - Tipografia corpo: [Google Font]
> - Tom da marca: [técnico/cinematográfico/clean/...]
>
> **Páginas obrigatórias:** /, /servicos (ou equivalente), /sobre, /contato, /blog, /blog/[slug],
> /faq, /portfolio (ou equivalente), /404.
>
> **Tarefas:**
> 1. Criar a estrutura de pastas conforme §2 do playbook.
> 2. Implementar `lib/company.ts` com a NAP fornecida.
> 3. Implementar `lib/schemas.ts` com todos os geradores listados em §7.2.
> 4. Implementar `components/SEO.astro`, `Base.astro`, `Navbar.astro`, `Footer.astro`, `Breadcrumb.astro`.
> 5. Configurar `astro.config.ts` e `tailwind.config.ts` conforme §3 e §4.
> 6. Criar `global.css` com `@font-face` local, `:focus-visible`, glass, glow, `overflow-x: clip`.
> 7. Implementar páginas seguindo o esqueleto de §11, cada uma com `pageType`, `breadcrumb` e `schemas` apropriados.
> 8. Garantir o checklist A11y de §9 e os alvos de performance de §10.
> 9. Não criar nenhum endpoint backend — o site consome o backoffice externo via fetch em build time.
>
> Antes de gerar código, confirme entendimento e me pergunte qualquer ponto ambíguo das
> identidades acima. Não invente NAP, paleta ou conteúdo institucional — peça.

---

**Última atualização:** 2026-05-03 — derivado da implementação real do AUMAF 3D (Q1 + UX/A11y/SEO/GEO sprint).
