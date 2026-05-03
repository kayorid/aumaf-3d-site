---
feature: frontend-public-uxa11y-seo-geo
created: 2026-05-03
---

# Design — Polimento UX/A11y/SEO/GEO front-public

## Visão arquitetural

Toda a melhoria é **camada-fina** — alterações localizadas em `Base.astro`, `Navbar.astro`, `Footer.astro`, `global.css`, `tailwind.config.ts`, mais ajustes cirúrgicos por página. Não há nova dependência npm. Não há novo componente cross-cutting além de:

- **`SEO.astro`** (novo) — props que centralizam meta-tags, OG, schema JSON-LD e breadcrumb. Substitui parte do que está hoje hardcoded em `Base.astro`.
- **`Breadcrumb.astro`** (novo) — `<nav aria-label="Trilha">` com `<ol>` semântico + emit do schema `BreadcrumbList` correspondente.
- **`schemas.ts`** (novo, em `src/lib/schemas.ts`) — funções tipadas que retornam objetos JSON-LD para `Organization`, `LocalBusiness`, `Service`, `FAQPage`, `BlogPosting`, `BreadcrumbList`, `HowTo`. Centraliza os dados NAP da empresa.

## Decisões técnicas

### D1 — Centralização de schema com `@graph`
Em vez de inserir múltiplos `<script type="application/ld+json">`, usamos um único bloco `@graph` por página com todos os esquemas relevantes. Vantagem: menos parser JSON, menos peso, melhor para Google.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://aumaf3d.com.br/#org", ... },
    { "@type": "LocalBusiness", "@id": "https://aumaf3d.com.br/#local", ... },
    { "@type": "WebSite", "@id": "https://aumaf3d.com.br/#site", ... },
    { "@type": "WebPage", "@id": "<URL>#page", ... },
    { "@type": "BreadcrumbList", ... }
  ]
}
</script>
```

### D2 — `SEO.astro` substitui meta-tags inline em Base
O `Base.astro` injeta hoje os meta-tags. Refatoração: novo componente `<SEO {...props} />` chamado dentro do `<head>` do `Base.astro`. Props:

```ts
interface SEOProps {
  title: string
  description: string
  ogImage?: string         // default '/og/og-default.png'
  ogType?: 'website' | 'article'
  noindex?: boolean
  schemas?: Record<string, unknown>[]   // injeta no @graph
  breadcrumb?: { name: string; url: string }[]
  article?: { datePublished: string; dateModified?: string; author?: string; section?: string }
}
```

### D3 — Skip-link
Inserido logo após `<body>` no `Base.astro`:
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-surface-high focus:text-primary-container focus:rounded focus:shadow-lg">
  Pular para o conteúdo
</a>
```

E `<slot />` é envolvido em `<main id="main-content" tabindex="-1">`. (`tabindex="-1"` permite foco programático mas não captura na ordem natural.)

### D4 — Contraste — política de troca
Mapeamento canônico (com base em #000000):
| Atual | Ratio aprox. | Ação | Substituição |
|---|---|---|---|
| `text-white/10` | 1.4:1 | bordas decorativas → manter; texto → trocar | `text-tertiary-container` (b1afaf, ~9:1) |
| `text-white/15` | 1.6:1 | trocar | `text-on-surface-variant` (becab6, ~10:1) |
| `text-white/20` | 1.9:1 | trocar | `text-on-surface-variant` |
| `text-white/25` | 2.3:1 | trocar | `text-on-surface-variant` |
| `text-white/30` | 2.8:1 | trocar | `text-on-surface-variant` |
| `text-white/40` | 3.7:1 | trocar | `text-tertiary` (cdcaca, ~13:1) ou `white/60` |
| `text-white/50` | 4.7:1 | aceitar para >= 18pt; trocar para texto normal | `text-tertiary` |
| `text-white/60` | 5.7:1 | aceitar | manter |
| `text-white/70+` | 6.7:1+ | aceitar | manter |

Bordas/divisores (`border-white/5`, `border-white/10`) podem ficar — não são texto.

### D5 — Foco visível global
Adicionar em `global.css` `@layer base`:
```css
*:focus-visible {
  outline: 2px solid theme('colors.primary.container');
  outline-offset: 2px;
  border-radius: 2px;
}
```
Combinado com utility custom `.focus-ring` para botões/links que precisam style mais elaborado.

### D6 — `prefers-reduced-motion`
Adicionar em `global.css` `@layer utilities`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
Animações decorativas infinitas (`marquee`, `pulse-dot`, etc.) ficam efetivamente paradas.

### D7 — FAQ accordion ARIA
Refatorar `<details>` ou divs em `<button>` + `<region>`:
```html
<div class="accordion-item" data-accordion>
  <button
    class="accordion-trigger"
    aria-expanded="false"
    aria-controls="panel-q1"
    id="trigger-q1"
  >
    <span>É possível imprimir uma única peça?</span>
    <span class="accordion-icon" aria-hidden="true">+</span>
  </button>
  <div
    id="panel-q1"
    role="region"
    aria-labelledby="trigger-q1"
    class="accordion-content"
    hidden
  >
    <p>Sim. A impressão 3D não depende de moldes...</p>
  </div>
</div>
```
JS:
```js
document.querySelectorAll('[data-accordion] .accordion-trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true'
    const panel = document.getElementById(btn.getAttribute('aria-controls'))
    btn.setAttribute('aria-expanded', String(!expanded))
    btn.parentElement.classList.toggle('open', !expanded)
    if (expanded) {
      panel.setAttribute('hidden', '')
    } else {
      panel.removeAttribute('hidden')
    }
  })
})
```
"Abrir todos" / "Fechar todos" replicam o toggle em batch.

### D8 — Filter pills (portfolio, materiais, faq)
Padrão: `<div role="group" aria-label="Filtrar por categoria">` contendo `<button role="radio" aria-checked="true|false">`. Quando filtro muda:
- Atualizar `aria-checked` em todos os pills.
- Atualizar contador `<span aria-live="polite">Exibindo X de Y</span>`.
- Mostrar `#empty-state` se 0 resultados.

### D9 — Formulário /contato
Cada campo:
```html
<div>
  <label for="email" class="block text-label-caps text-on-surface-variant uppercase tracking-widest mb-2">
    Email <span aria-hidden="true">*</span>
    <span class="sr-only">(obrigatório)</span>
  </label>
  <input
    id="email"
    name="email"
    type="email"
    required
    autocomplete="email"
    aria-describedby="email-error email-hint"
    aria-invalid="false"
    class="input-underline"
  />
  <p id="email-hint" class="sr-only">Usaremos para retornar o orçamento</p>
  <p id="email-error" role="alert" class="text-error text-sm mt-1 hidden"></p>
</div>
```
Validação JS sob `submit`:
- Para cada campo inválido: `aria-invalid="true"`, mensagem em `#X-error` desocultada.
- `<button type="submit" aria-busy="false">` vira `aria-busy="true"` durante envio.
- Sucesso: foca em `#form-success` que tem `tabindex="-1"` e mensagem visível.

### D10 — Schema FAQPage / HowTo
Em `/faq` e em posts tutoriais:

```ts
faqPageSchema(faqs: { q: string; a: string }[]) → {
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a }
  }))
}

howToSchema(name, description, steps: { name; text; image? }[]) → {
  '@type': 'HowTo',
  name, description,
  step: steps.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.name,
    text: s.text
  }))
}
```

### D11 — Breadcrumb estrutural
Componente `<Breadcrumb items={[{name:'Blog', url:'/blog'}, {name: post.title}]} />`:

```astro
<nav aria-label="Trilha">
  <ol class="flex items-center gap-2 text-sm text-on-surface-variant">
    <li><a href="/" class="hover:text-primary-container">Home</a></li>
    {items.map((item, i) => (
      <>
        <li aria-hidden="true">/</li>
        <li>
          {i === items.length - 1
            ? <span aria-current="page" class="text-primary-container">{item.name}</span>
            : <a href={item.url} class="hover:text-primary-container">{item.name}</a>}
        </li>
      </>
    ))}
  </ol>
</nav>
```
Schema correspondente injetado no `@graph` da página.

### D12 — robots.txt
`public/robots.txt`:
```
User-agent: *
Allow: /

# AI crawlers — explicitamente permitidos
User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://aumaf3d.com.br/sitemap-index.xml
```

### D13 — OG image default
Como gerar imagens OG sem dependência:
- Criar `/public/og/og-default.svg` (texto AUMAF 3D + tagline + verde sobre preto, 1200×630).
- Para posts: por ora, reaproveitar `og-default` ou cover existente (SAE-formula.avif para o post SAE).
- Salvar SVG (servidor pode entregar como `image/svg+xml`; OG funciona com SVG em redes modernas; alternativamente exportar para PNG via Astro Image — TODO follow-up).

Decisão pragmática: criar `og-default.svg` agora. Documentar TODO de PNG export para depois (não bloqueia AC-SEO-2).

### D14 — Tabelas semânticas
Substituir `<div class="grid">` que representa dados tabulares (specs case SAE, comparação FDM/SLA/SLS) por `<table>` real com classes Tailwind. Exemplo:
```html
<table class="w-full text-sm border-collapse">
  <caption class="sr-only">Comparação entre processos FDM, SLA e SLS</caption>
  <thead class="text-on-surface-variant uppercase text-label-caps">
    <tr>
      <th scope="col" class="text-left py-2 px-3">Critério</th>
      <th scope="col" class="text-left py-2 px-3">FDM</th>
      ...
    </tr>
  </thead>
  <tbody>
    <tr class="border-t border-white/5">
      <th scope="row" class="py-2 px-3 font-bold">Acabamento</th>
      <td class="py-2 px-3">Camadas visíveis</td>
      ...
    </tr>
  </tbody>
</table>
```

### D15 — Espaçamento consistente
Política: usar `pt-section`/`pb-section` para tops/bottoms de seção principal e `py-section` quando ambos. Ajustes:
- Substituir `py-14`, `py-16`, `py-20` em containers de seção por `py-section` quando faltarem.
- Manter `mb-X` interno menor (mb-4, mb-6, mb-8) para spacing dentro de uma seção.

### D16 — TL;DR + Table of Contents para posts longos
Adicionar no template `[slug].astro` e nos 4 posts hardcoded:
- Após hero, antes de conteúdo: `<aside class="glass-panel p-6 mb-8" aria-label="Resumo rápido">` com `<h2 class="sr-only">TL;DR</h2>` e `<ul>`.
- Sticky `<aside class="hidden lg:block sticky top-24" aria-label="Índice deste artigo">` com TOC gerada manualmente (anchors para `id` dos h2 do post).

### D17 — Share buttons múltiplos
Adicionar no `[slug].astro` um cluster:
```html
<div class="flex items-center gap-3" role="group" aria-label="Compartilhar este artigo">
  <a href="https://wa.me/?text={encodeURIComponent(title + ' ' + url)}" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no WhatsApp (abre em nova aba)">...</a>
  <a href="https://www.linkedin.com/sharing/share-offsite/?url={url}" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no LinkedIn (abre em nova aba)">...</a>
  <a href="https://twitter.com/intent/tweet?url={url}&text={title}" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no X (abre em nova aba)">...</a>
  <button type="button" id="copy-link" aria-label="Copiar link">...</button>
</div>
```

### D18 — Mobile drawer focus trap + Esc
JS adicional no Navbar.astro:
```js
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && open) toggle.click()
})
// focus trap simples: ao abrir, focar no primeiro link; ao Tab no último, voltar pro primeiro.
```

### D19 — Imagens com aspect-ratio + lazy
Padronizar:
```html
<img
  src="/images/SAE-formula.avif"
  alt="..."
  width="1280"
  height="720"
  loading="lazy"
  decoding="async"
  class="w-full aspect-[16/9] object-cover"
/>
```
Hero/above-the-fold: `loading="eager"` + `fetchpriority="high"`.

### D20 — Material Symbols `&display=swap`
Atualizar URL no `Base.astro:54` adicionando `&display=swap`. Sem migração para self-host nesta fase (escopo).

## Modelo de dados (NAP/Empresa)

Centralizado em `src/lib/company.ts`:
```ts
export const COMPANY = {
  name: 'AUMAF 3D',
  legalName: 'AUMAF 3D — Manufatura Aditiva',
  url: 'https://aumaf3d.com.br',
  logo: 'https://aumaf3d.com.br/logo.png',
  founded: '2022',
  description: 'Manufatura aditiva industrial de alta precisão. Peças em metal, carbono e polímeros com tolerância ±0.05mm.',
  address: {
    streetAddress: 'Alameda Sinlioku Tanaka, 202',
    addressLocality: 'São Carlos',
    addressRegion: 'SP',
    postalCode: '13565-261',
    addressCountry: 'BR',
    neighborhood: 'Parque Tecnológico Damha II',
  },
  geo: { latitude: -21.9766, longitude: -47.9064 },
  contact: {
    phone: '+5516992863412',
    whatsapp: 'https://wa.me/5516992863412',
    email: 'comercial@auma3d.com.br',
  },
  hours: { open: '08:00', close: '18:00', days: ['Mon','Tue','Wed','Thu','Fri'] },
  socials: {
    instagram: 'https://instagram.com/auma.3d/',
    linkedin: 'https://linkedin.com/company/auma3d/',
    facebook: 'https://facebook.com/auma3d',
  },
} as const
```

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Mudar muitas cores `white/X` quebra visual sutil | Mudar 1 página por vez, screenshot antes/depois, revisar |
| Schema JSON-LD inválido derruba rich snippets | Validar via https://validator.schema.org após build local |
| Refatoração do FAQ accordion quebra interação visual | Manter classes CSS atuais (`.accordion-item.open`), só adicionar `aria-*` + JS update |
| `<main>` pode interferir com sticky/overflow do v6 | Testar — `<main>` não cria BFC por default; sticky deve continuar funcionando |
| Imagens OG SVG não renderizam em todos os crawlers | Aceitar; gerar PNG depois é follow-up |
| Build do Astro pode reclamar de classes Tailwind dinâmicas (purge) | Usar safelist em tailwind.config se aparecer |

## Alternativas consideradas (e descartadas)

- **`astro-seo` package**: descartado — adiciona dependência, esquemas que queremos são poucos, melhor controle local.
- **Migrar posts para Content Collections**: descartado — escopo da Q2 (backoffice integration).
- **Self-host Material Symbols**: descartado — ganho marginal vs custo de manutenção; com `&display=swap` já não bloqueia render.
- **Implementar i18n (en-US)**: fora de escopo — site é mono-idioma pt-BR.
- **Adicionar Astro View Transitions**: tentador, mas fora de escopo dessa fase.

## Validação pós-implementação

1. **Lighthouse** (mobile + desktop) em todas as 13 páginas — alvo: Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100.
2. **axe DevTools** — varredura por página, alvo: 0 issues critical/serious.
3. **Schema.org Validator** — cada página com schema JSON-LD validada.
4. **Manual a11y** — Tab pelo site inteiro, conferir foco visível, skip-link, drawer focus trap, FAQ accordion com leitor de tela.
5. **Build clean** — `npm run build` sem warnings novos; `npm run typecheck` ok.
6. **Sitemap inspection** — abrir `dist/sitemap-index.xml`; confirmar 13 URLs.
