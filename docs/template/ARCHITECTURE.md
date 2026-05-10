# Architecture — Visão técnica

Este documento descreve as decisões técnicas do template e como os pedaços se conectam. Útil para devs que precisam estender o template ou debugar problemas.

---

## Topologia em três camadas

```
                            ┌────────────────────┐
                            │   @template/shared │  ← Zod schemas + TemplateConfig
                            └─────────┬──────────┘
                                      │
            ┌─────────────────────────┼──────────────────────────┐
            ▼                         ▼                          ▼
   ┌─────────────────┐      ┌──────────────────┐       ┌──────────────────┐
   │ frontend-public │      │  frontend-admin  │       │     backend      │
   │  (Astro 5 SSR)  │      │ (React 18 + Vite)│       │ (Express+Prisma) │
   └────────┬────────┘      └─────────┬────────┘       └────────┬─────────┘
            │                         │                         │
            │   ──── HTTP /api/v1 ────┼─────────────────────────┘
            │                         │
            ▼                         ▼
       Postgres 16 ←─── Prisma ───→ Redis 7 + BullMQ ──→ Workers (mesmo processo)
                                            │
                                            └── MinIO (dev) / S3 (prod)
```

---

## `@template/shared`

Pacote workspace que centraliza:

1. **Tipagens da identidade** (`TemplateConfig` em `src/template/types.ts`)
2. **A instância da identidade** (`templateConfig` em `src/template/config.ts`)
3. **Zod schemas** compartilhados entre admin e backend (`src/schemas/*`)

Garante que admin e backend nunca divergem em DTOs. Adicionou um campo no schema do post? Os dois lados pegam imediatamente.

**Importante:** o `templateConfig` é lido **em build-time** por Astro e Vite. Para mudar a marca em runtime, precisaria de mudança arquitetural (carregar config por host).

---

## Site público — Astro 5

- **SSR padrão** com adapter Node standalone.
- Páginas com `export const prerender = true` (home, serviços, etc.) viram HTML estático no build.
- Blog (`/blog`, `/blog/[slug]`) é SSR puro — cada F5 lê da API.
- Sitemap dinâmico via `@astrojs/sitemap` + `dynamicBlogPages()`.
- Tailwind com `applyBaseStyles: false` (controlamos o reset em `global.css`).
- SEO completo: schemas Organization, LocalBusiness, WebSite, WebPage, BlogPosting, FAQPage, ItemList, BreadcrumbList.

### Performance

- `inlineStylesheets: 'auto'` — CSS crítico inline.
- `prefetch: { defaultStrategy: 'hover' }` — speculation rules sem agressividade.
- Preload do hero image via prop `preloadImage` no `Base`.
- `compressHTML: true`.

---

## Backoffice — React 18 + Vite

- **TanStack Query v5** para server state — cache + invalidation declarativo.
- **Zustand** para UI state leve (apenas auth.store).
- **React Hook Form + Zod** em todos os formulários (validação compartilhada com backend).
- **Radix UI primitives** + Tailwind — todos os componentes são a11y por construção.
- **TipTap dual** — editor é Markdown como persistência, mas WYSIWYG visualmente (BlockPreview fiel ao DS público).
- **Sonner** para toasts.
- **CASL** para autorização cliente — espelha as permissões do backend.

### Convenções

- Features em `src/features/<domain>/` — cada uma tem `api/`, `components/`, `pages/`, `hooks/`.
- Path alias `@/` aponta para `src/`.
- Storybook **obrigatório** em componentes de DS novos. Configuração já tem tema Cinematic + addon de a11y.

---

## Backend — Node + Express + Prisma

- Entry point `src/server.ts` — `app.listen()` + `bootWorkers()`.
- `src/app.ts` — factory de Express com middlewares (helmet, cors, cookie-parser, rate-limit, error handler).
- Rotas em `src/routes/`, controllers em `src/controllers/`, lógica em `src/services/`.
- Validação de input via Zod schemas de `@template/shared`.
- JWT em cookie httpOnly + CSRF check via `SameSite=lax`.
- Logs com Pino — JSON em prod, pretty em dev.

### BullMQ workers

- Workers no **mesmo processo Express** (single-binary deploy).
- `lead-notification.worker.ts` — envia e-mail ao admin quando lead é criado.
- `post-publish.worker.ts` — warmup do cache SSR Astro após publish.
- Health: `GET /health` agrega DB + Redis + queues.
- Graceful shutdown: SIGTERM/SIGINT → `shutdownWorkers(10s)` → Prisma disconnect.

Para escalar workers separadamente, separar entry e usar `bootWorkers` em outro processo. Schema sem `tenantId` — uma instância = uma marca.

---

## Database — PostgreSQL 16 + Prisma

Schema em `backend/prisma/schema.prisma`. Tabelas principais:

- `User` — admin login (JWT) + permissões CASL via campo `role`
- `Category` — categorias de posts
- `Post` — posts do blog, status DRAFT/PUBLISHED
- `Lead` — captação de leads do form de contato
- `Media` — uploads via MinIO/S3 (metadata)
- `Setting` — singleton (`id: 'default'`) com config editável via admin
- `IntegrationConfig` — credenciais de IA, Botyo, etc.

**Sem multi-tenancy.** Não adicione `tenantId` — o template é "uma instância por marca". Para servir múltiplas marcas, suba múltiplas instâncias.

---

## Filas + cache + storage

- **Redis 7** — backing store do BullMQ + cache HTTP do SSR Astro.
- **MinIO** (dev) / **S3** (prod) — armazenamento de uploads (imagens de blog, logos).
- **`maxRetriesPerRequest: null`** no IORedis — exigência do BullMQ.

---

## Theming (resumo)

CSS variables em `frontend-public/src/styles/themes/<theme>.css`. Tailwind (public + admin) usa `rgb(var(--color-*) / <alpha-value>)`. Trocar tema = trocar `@import` em `global.css` e `index.css`. Detalhes em [`THEMING.md`](THEMING.md).

---

## Identidade (resumo)

Tudo em `packages/shared/src/template/config.ts`. Re-exportado pelo alias raiz `template.config.ts`. Detalhes em [`REBRAND.md`](REBRAND.md).

---

## Build pipeline

- **Turbo** (`turbo.json`) — orquestra `build`, `lint`, `typecheck`, `test`.
- Cada workspace tem seus próprios scripts npm. Adicione novos workspaces em `package.json` raiz.

---

## Deploy

`deploy/` tem o setup VPS Hostinger (Caddy + Docker Compose). Runbooks em `docs/runbooks/`. Para deploys gerenciados (Vercel, Render, Fly.io), os três workspaces fazem build standalone — basta apontar o build command e o output dir.

---

## Onde os "ganchos" do template estão

Pontos comuns de extensão:

| Quero... | Vou em... |
|---|---|
| Adicionar campo na config | `packages/shared/src/template/types.ts` + `config.ts` |
| Adicionar tema novo | `frontend-public/src/styles/themes/<name>.css` |
| Adicionar página vitrine | `frontend-public/src/pages/<name>.astro` |
| Adicionar feature no admin | `frontend-admin/src/features/<name>/` |
| Adicionar worker | `backend/src/workers/<name>.worker.ts` + import em `workers/register.ts` |
| Adicionar campo no schema | `backend/prisma/schema.prisma` → `prisma migrate dev` |
| Adicionar provedor de IA | `backend/src/services/ai/providers/<name>.ts` + registrar em `provider.factory.ts` |
