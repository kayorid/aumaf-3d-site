# Frontend Público — Astro 5

## Comandos

```bash
npm run dev               # astro dev → http://localhost:4321
npm run build             # tsx scripts/generate-llm-sources.ts && astro build
npm run build:llm-sources # gera só os .md (faq/glossario/servicos/materiais)
npm run preview
npm run typecheck         # astro check

# Bundle visualizer opt-in (cria dist/stats.html — não rodado em CI/Docker)
BUNDLE_AUDIT=1 npm run build
```

## Estrutura

```
frontend-public/src/
├── pages/                  # rotas file-based (.astro)
├── layouts/                # Base.astro (head + schemas + preload + analytics)
├── components/             # componentes Astro e React islands
├── data/                   # ⭐ dados canônicos compartilhados (faqs, glossario, servicos, guias, industrias)
├── lib/                    # schemas.ts (JSON-LD factories), company.ts, api.ts
└── styles/                 # global.css, tokens CSS
scripts/
└── generate-llm-sources.ts # gera public/*.md a partir de src/data/*
public/
├── llms.txt                # índice canônico para LLMs (manter atualizado)
├── llms-full.txt           # versão estendida
├── *.md                    # gerados pelo script (faq, glossario, servicos, materiais)
└── images/                 # imagens estáticas; bg-*.webp para heros
```

## Padrões

### Conteúdo como dados (`src/data/*.ts`)
**Sempre** que um array de conteúdo for usado em mais de um lugar (página + schema + gerador de .md), extraia para `src/data/<nome>.ts`. Pages importam:

```ts
import { faqs } from '../data/faqs'
```

Isso evita drift entre o que o usuário vê (HTML) e o que LLMs consomem (.md). Materiais é exceção legada: lista vive em `materiais.astro` + cópia compacta no script (manter sincronizado manualmente).

### Schemas JSON-LD
Factories em `src/lib/schemas.ts`. Cada `.astro` monta um array `schemas` e passa para Base. Não inline JSON-LD em template. Para novas entidades, criar factory antes de usar.

```astro
const schemas = [
  webPageSchema({ url, name, description, type: 'CollectionPage' }),
  breadcrumbSchema([...]),
  serviceSchema({...}),
  faqPageSchema([...]),
]
```

### LLM Markdown sources
Páginas de conteúdo (FAQ, glossário, catálogos) devem ter versão `.md` cru exposta. Editar `scripts/generate-llm-sources.ts` para incluir. Linkar de `llms.txt` (seção "Markdown sources").

### Preload de bg hero (LCP)
Páginas com `background-image:url(...)` no hero devem passar a URL ao Base:

```astro
<Base ... preloadImage="/images/bg-X.webp">
```

CSS bg não aceita `fetchpriority` direto; o `<link rel=preload as=image fetchpriority=high>` no `<head>` resolve.

### Páginas dinâmicas
- **SSG**: `[slug].astro` com `getStaticPaths()` + `export const prerender = true` (padrão para guias, indústrias).
- **SSR endpoint customizado**: `[param].ext.ts` com `export const prerender = false` e `GET: APIRoute` (ex: `[key].txt.ts` para IndexNow).
- **SSR puro**: blog dinâmico — `output: 'server'` global + sem prerender.

### Hidratação
`client:load` / `client:visible` apenas quando necessário. Maioria das interações é vanilla JS no `<script>` da `.astro`.

### Imagens
- `<img>` direto com `loading="lazy"` para conteúdo abaixo do fold.
- Heros: bg CSS + `preloadImage` prop (ver acima).
- Migração para `<Image>` do Astro (srcset + AVIF) está em backlog (`docs/perf/`).

### SEO
Meta tags + Open Graph + schema via `<Base>`. Sitemap automático via `@astrojs/sitemap`. Robots customizado via `src/pages/robots.txt.ts`.

## Quando adicionar página pública nova

Use a skill `seo-geo-content` — checklist obrigatório (schemas + data + .md + llms.txt + analytics).
