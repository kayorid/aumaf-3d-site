# Design — Q2 Phase 2

> HOW técnico. Stack, estrutura, contratos, integrações, riscos.

---

## 1. Visão geral da arquitetura Phase 2

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND PÚBLICO (Astro 5 hybrid)           │
│   /blog (prerender)  /blog/[slug] (prerender + ISR)                 │
│   ──────── consome via fetch ────────                               │
└─────────────────────────────────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       BACKEND API  (Express + Prisma)               │
│  /api/v1/public/posts          (lista — paginada, ETag, Cache)      │
│  /api/v1/public/posts/:slug    (detalhe — ETag, Cache)              │
│  /api/v1/public/settings       (analytics IDs ativos)               │
│  /api/v1/leads                 (CRUD admin)                         │
│  /api/v1/categories            (CRUD admin)                         │
│  /api/v1/settings              (GET/PATCH admin)                    │
│  /api/v1/posts/:id/auto-save   (PATCH com debounce)                 │
└─────────────────────────────────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│            POSTGRES (Prisma)               MINIO (imagens)          │
└─────────────────────────────────────────────────────────────────────┘

      ┌──────────────────────────────────────────────┐
      │       FRONTEND ADMIN (React + Vite)          │
      │   /admin/leads     /admin/settings           │
      │   /admin/categories                          │
      │   /admin/posts/:id  (com auto-save + IA)     │
      └──────────────────────────────────────────────┘
```

## 2. Modelo de dados — alterações no Prisma

```prisma
model Post {
  id               String     @id @default(cuid())
  title            String
  slug             String     @unique
  excerpt          String?
  content          String     // Markdown + HTML inline
  coverImageUrl    String?
  status           PostStatus @default(DRAFT)
  metaTitle        String?
  metaDescription  String?
  generatedByAi    Boolean    @default(false)
  publishedAt      DateTime?
  // === Phase 2 (novos campos) ===
  readingTimeMin   Int?       // tempo de leitura em minutos
  featured         Boolean    @default(false)
  tags             String[]   @default([])  // PostgreSQL native array
  // === fim Phase 2 ===
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  author     User?     @relation("AuthorPosts", fields: [authorId], references: [id])
  authorId   String?
  category   Category? @relation(fields: [categoryId], references: [id])
  categoryId String?

  @@index([status, publishedAt(sort: Desc)])  // listagem pública
  @@index([featured, publishedAt(sort: Desc)]) // destaque
  @@map("posts")
}
```

**Migration**: `prisma migrate dev --name add_post_reading_featured_tags`. Nada destrutivo (todos campos opcionais ou com default).

## 3. Estratégia de migração de conteúdo (a chave do Phase 2)

### 3.1 Princípio: Markdown + HTML inline preservado

Os 6 posts `.astro` têm 3 tipos de conteúdo:

| Tipo | Exemplo | Estratégia |
|------|---------|-----------|
| **Texto narrativo** | `<p>` | Markdown puro |
| **Heading** | `<h2 class="text-headline-md...">` | Markdown puro `## ...` (classes vêm do CSS `.prose-aumaf h2`) |
| **Lista simples** | `<ul>`, `<li>` | Markdown puro `- ...` |
| **Tabela GFM** | `<table>` simples | Markdown GFM `| col | col |` |
| **Glass-panel cards** | `<div class="glass-panel">...</div>` | **HTML inline** no Markdown — o renderer passa through |
| **Specs grid (dl/dt/dd)** | grid de 6 specs | **HTML inline** com classes do DS |
| **Decision flow numerado** | 3 perguntas com badge circular | **HTML inline** |
| **Blockquote estilizado** | `<blockquote class="glass-panel border-l-2...">` | **HTML inline** (Markdown `>` perderia estilo) |
| **Comparison table rica** | `<table>` com classes glass-panel | **HTML inline** (GFM Markdown não preserva classes) |

### 3.2 Como funciona o pass-through

- O Markdown é renderizado por `marked` (ou `markdown-it`) com `html: true`
- O HTML inline é preservado as-is
- As classes Tailwind (`glass-panel`, `text-headline-md`, `text-primary-container`, etc.) são **safelisted** no `tailwind.config.ts` do público para que o purge não as remova
- O Astro renderiza o HTML resultante dentro de `<div class="prose-aumaf">` mantendo todo o estilo original

### 3.3 Conversor `scripts/migrate-blog-posts.ts`

Estratégia: extrair manualmente o conteúdo da pasta `<article class="bg-background pb-section">` ... `</article>` de cada `.astro`, removendo apenas o wrapper Astro e o `Astro.props`.

```ts
// Pseudo-código
const POSTS = [
  {
    slug: 'fdm-vs-sla-vs-sls',
    title: 'FDM, SLA ou SLS? O Guia Definitivo para Escolher o Processo Certo',
    excerpt: '...',
    category: 'Guia Técnico',
    publishedAt: new Date('2026-05-01'),
    readingTimeMin: 8,
    featured: true,
    coverImageUrl: null, // SVG decorativo, sem imagem
    content: extractContentFromAstro('frontend-public/src/pages/blog/fdm-vs-sla-vs-sls.astro'),
  },
  // ...6 posts total
]

async function main() {
  for (const post of POSTS) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(post.category) },
      create: { name: post.category, slug: slugify(post.category) },
      update: {},
    })
    await prisma.post.upsert({
      where: { slug: post.slug },
      create: { ...post, status: 'PUBLISHED', categoryId: category.id, authorId: ADMIN_ID },
      update: { ...post, status: 'PUBLISHED', categoryId: category.id },
    })
  }
}
```

A função `extractContentFromAstro` lê o `.astro`, encontra o bloco `<div class="prose-aumaf">...</div>`, faz transformações triviais (`{title}` → texto literal, remove escapamentos JSX), e devolve o conteúdo como string Markdown+HTML.

**Imagens**: a única imagem real é `SAE-formula.avif`. Faz upload via S3 SDK do backend para o MinIO (`s3://aumaf-blog-images/migrated/SAE-formula.avif`) e usa essa URL como `coverImageUrl` nos 2 posts da Fórmula SAE.

### 3.4 Tailwind safelist

```ts
// frontend-public/tailwind.config.ts
safelist: [
  // Layouts
  'glass-panel', 'pill', 'pill-active', 'pill-green',
  // Tipografia DS
  'text-display-xl', 'text-headline-lg', 'text-headline-md',
  'text-body-lg', 'text-body-md', 'text-label-caps', 'text-code-data',
  // Cores DS
  'text-primary-container', 'text-on-surface', 'text-on-surface-variant',
  'text-tertiary', 'text-white', 'bg-primary-container',
  // Bordas e backgrounds DS
  'border-primary-container', 'border-white/8', 'border-white/12',
  // Patterns recorrentes
  { pattern: /^(text|bg|border)-(primary-container|tertiary|on-surface|on-surface-variant|white)\/(5|8|10|12|15|20|25|30|40|50|60|70|80|90)$/ },
  { pattern: /^(opacity|w|h|aspect|grid|gap|p|m|rounded)-/ },
],
```

## 4. Backend — endpoints novos

### 4.1 Endpoints públicos (sem auth)

```
GET /api/v1/public/posts
  query: page=1, limit=12, category?, featured?
  returns: { items: PostPublicDto[], total, page, totalPages }
  cache: ETag + Cache-Control: public, s-maxage=60, stale-while-revalidate=300

GET /api/v1/public/posts/:slug
  returns: PostPublicDto | 404
  cache: ETag + Cache-Control: public, s-maxage=60, stale-while-revalidate=600

GET /api/v1/public/settings
  returns: { ga4MeasurementId, clarityProjectId, fbPixelId, gtmContainerId, customHeadScripts, customBodyScripts }
  cache: Cache-Control: public, s-maxage=120
```

### 4.2 Endpoints admin (auth required)

```
GET    /api/v1/leads                    (filtros + paginação)
GET    /api/v1/leads/export.csv         (com mesmos filtros)
PATCH  /api/v1/leads/:id                (update status — opcional)

GET    /api/v1/settings                 (lê o singleton)
PATCH  /api/v1/settings                 (atualiza com Zod)

POST   /api/v1/categories
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id           (409 se posts associados)

PATCH  /api/v1/posts/:id/auto-save      (mesmo body do PATCH /posts/:id, sem invalidar publicação)
```

### 4.3 PostPublicDto

```ts
{
  slug, title, excerpt, content, coverImageUrl,
  publishedAt, readingTimeMin, featured, tags,
  category: { name, slug },
  author: { name },
  metaTitle?: string,
  metaDescription?: string,
}
```

### 4.4 Schemas Zod (novos em `@aumaf/shared`)

- `PostPublicDtoSchema`
- `PublicPostListResponseSchema`
- `PublicSettingsDtoSchema`
- `LeadFilterQuerySchema` (`from?, to?, source?, q?, page?, limit?`)
- `UpdateSettingsSchema` (já existe — expandir validações regex)
- `CreateCategorySchema`, `UpdateCategorySchema`

### 4.5 Validação de IDs em Settings

| Campo | Regex |
|-------|-------|
| `ga4MeasurementId` | `^G-[A-Z0-9]{8,12}$` |
| `gtmContainerId` | `^GTM-[A-Z0-9]{6,8}$` |
| `clarityProjectId` | `^[a-z0-9]{8,12}$` |
| `facebookPixelId` | `^\d{15,16}$` |
| `whatsappNumber` | `^\+?[1-9]\d{10,14}$` |
| URL fields | `z.string().url()` |

## 5. Frontend público — Astro hybrid

### 5.1 `astro.config.ts`

```ts
import node from '@astrojs/node'

export default defineConfig({
  site: 'https://aumaf3d.com.br',
  output: 'hybrid',                     // <-- mudou
  adapter: node({ mode: 'standalone' }), // <-- novo
  // ...
})
```

### 5.2 Roteamento

- `/` , `/servicos`, `/sobre`, `/contato`, `/portfolio`, `/materiais`, `/faq` → permanecem **estáticos** (`export const prerender = true`)
- `/blog` → **prerender no build** + revalidação ao publicar (via webhook ou simples cache HTTP de 60s na CDN)
- `/blog/[slug]` → `getStaticPaths` puxa lista do backend em build time + ISR para slugs novos

### 5.3 Renderer Markdown

```ts
// frontend-public/src/lib/render-post.ts
import { marked } from 'marked'
import gfm from 'marked-gfm-heading-id'

export function renderPostContent(markdown: string): string {
  marked.use(gfm())
  marked.setOptions({ breaks: false, gfm: true })
  // html: true por padrão; HTML inline preservado
  return marked.parse(markdown) as string
}
```

A `<article class="prose-aumaf">` continua envolvendo o conteúdo, e as classes Tailwind do DS estão safelisted.

### 5.4 Schemas JSON-LD dinâmicos

Reusa `blogPostingSchema()` já existente em `src/lib/schemas.ts`, alimentado com dados dinâmicos do post.

### 5.5 ISR / cache

- Layer 1: backend retorna `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` + ETag por slug
- Layer 2: Astro com adapter Node faz fetch on-demand; pode-se adicionar `Cache-Control` no response do Astro se necessário
- Layer 3 (futuro produção): Cloudflare/Hostinger CDN respeita os headers

## 6. Frontend admin — Phase 2 features

### 6.1 `/admin/leads`
- Query params na URL (`?from=…&to=…&source=…&q=…&page=…`)
- Filtros: DateRangePicker (Radix Popover + react-day-picker), Select de fonte, Input de busca
- Tabela com `email` clicável (`mailto:`), `phone` clicável (`tel:`/WhatsApp), `createdAt` formatado
- Botão "Exportar CSV" → `GET /leads/export.csv?<filtros>` → trigger de download

### 6.2 `/admin/settings`
- Tabs: "Geral" (siteName, contato), "Analytics" (4 IDs + scripts custom), "Integrações" (Botyo)
- Form com `react-hook-form` + Zod resolver
- Indicador "Salvo HH:MM" + botão "Reverter" enquanto há dirty fields

### 6.3 `/admin/categories`
- Tabela simples nome/slug/contagem + botão "Nova categoria"
- Modal de edição (Radix Dialog)
- Ao excluir com posts vinculados: backend retorna 409 com lista, front exibe AlertDialog explicando

### 6.4 Auto-save
- Hook `useAutoSave(postId, formData, { debounceMs: 5000 })`
- Estado: `idle | saving | saved | error`
- Indicator no topo do editor com `<time dateTime>` para o último save
- Após 3 falhas consecutivas: pausa + requer click manual em "Salvar"

## 7. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Tailwind safelist insuficiente — classes somem em produção | Média | Alta | `npm run build` + grep no CSS gerado para classes críticas (test smoke) |
| Astro hybrid quebra build de páginas estáticas existentes | Baixa | Alta | Garantir `export const prerender = true` em todas as páginas não-blog |
| Migração com encoding errado (acentos PT-BR) | Baixa | Alta | Script lê arquivo com `utf-8` explícito; teste manual nos 6 slugs |
| MinIO local sem internet pública: imagens `coverImageUrl` quebram em prod | Média | Média | Usar `S3_PUBLIC_URL` configurável; em prod aponta para CDN/S3 real |
| HTML inline com classes inválidas: visual degradado | Média | Média | Smoke test visual lado-a-lado por slug |
| Performance do `/blog/[slug]` em produção (Markdown parse a cada request) | Média | Baixa | Cache HTTP do backend + cache local LRU do `marked` no Astro |

## 8. Plano de testes

### Backend
- Jest unitário: services novos (leads filter, settings update, categories CRUD)
- Jest integração: GET `/public/posts/:slug` com 200, 404, ETag

### Admin
- Vitest: hooks `useAutoSave`, `useExportCsv`
- Vitest: validação Zod do form de Settings com regexes
- Playwright: criar lead → ver na UI → exportar CSV; criar categoria → atribuir post → tentar deletar (bloqueia)

### Público
- Smoke test visual: navegar nos 6 slogs migrados e comparar com referência (screenshot ou inspeção manual)
- Lighthouse `/blog` e 1 post: garantir ≥ 90 em SEO/Perf/A11y

### Migração
- Rodar `npm run migrate-posts` em DB limpo: 6 posts criados
- Rodar 2x: idempotente, ainda 6 posts
- Verificar `coverImageUrl` da Fórmula SAE aponta para MinIO

## 9. Plano de rollback

- **Schema Prisma**: migration adiciona apenas colunas opcionais → rollback = nova migration que dropa as colunas (ou simplesmente não usá-las).
- **Astro hybrid**: voltar `output: 'static'` + restaurar arquivos `.astro` originais (manter no `_legacy/` durante a fase).
- **Posts no DB**: script `npm run unmigrate-posts` que faz `prisma.post.deleteMany({ where: { slug: { in: SLUGS } } })`.

## 10. Não-objetivos / decisões deliberadamente postergadas

- Não implementar PR/issue tracking de posts
- Não implementar diff/versionamento entre revisões
- Não implementar sistema de "agendar publicação" — `publishedAt` no futuro é tratado como já publicado
- Não implementar geração de imagem por IA
