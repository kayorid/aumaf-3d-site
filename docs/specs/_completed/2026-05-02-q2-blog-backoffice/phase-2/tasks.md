# Tasks — Q2 Phase 2

> Branch: `feat/admin-q2-phase2-migration-blog-dynamic`
> Marcadores: `[P]` paralelizável · `[CHECKPOINT]` parar e validar com humano · `[opcional]` pode ficar para Q3

---

## Etapa A — Migração de posts (fundação)

- [ ] **A1**. Schema Prisma: adicionar `readingTimeMin Int?`, `featured Boolean @default(false)`, `tags String[] @default([])` ao Post + 2 índices compostos
- [ ] **A2**. Migration: `prisma migrate dev --name add_post_reading_featured_tags`
- [ ] **A3**. `[P]` Atualizar `PostDtoSchema` e adicionar `PostPublicDtoSchema` em `@aumaf/shared`
- [ ] **A4**. `[P]` Seed expandido de Categories: Guia Técnico, Materiais, Case Study, Engenharia, Parceria, Inovação
- [ ] **A5**. Backend: endpoint `GET /api/v1/public/posts` (lista paginada com cache + ETag)
- [ ] **A6**. Backend: endpoint `GET /api/v1/public/posts/:slug` (detalhe com cache + ETag)
- [ ] **A7**. Backend: endpoint `GET /api/v1/public/settings` (analytics IDs + scripts custom)
- [ ] **A8**. Script `backend/scripts/migrate-blog-posts.ts` — extrai conteúdo dos 6 `.astro`, faz upsert no DB
- [ ] **A9**. Subir `SAE-formula.avif` para MinIO via S3 SDK no script de migração
- [ ] **A10**. `package.json` script `migrate:posts` no backend
- [ ] **A11**. Tailwind safelist no `frontend-public/tailwind.config.ts` para classes do DS usadas em conteúdo
- [ ] **A12**. `[CHECKPOINT]` Validar visualmente: ler 1 post via API e renderizar em uma página de teste para confirmar fidelidade

## Etapa B — Blog público dinâmico

- [ ] **B1**. Instalar `@astrojs/node` no `frontend-public`
- [ ] **B2**. `astro.config.ts` → `output: 'hybrid'` + adapter Node
- [ ] **B3**. Adicionar `export const prerender = true` em todas as páginas estáticas (manter SSG)
- [ ] **B4**. `frontend-public/src/lib/api.ts` — cliente HTTP para o backend (com base URL via env)
- [ ] **B5**. `frontend-public/src/lib/render-post.ts` — `marked` configurado com GFM + html:true
- [ ] **B6**. `[P]` Reescrever `/blog/index.astro` consumindo `/public/posts` (mantém visual idêntico)
- [ ] **B7**. `[P]` Reescrever `/blog/[slug].astro` com `getStaticPaths` dinâmico + render Markdown (mantém visual idêntico)
- [ ] **B8**. Sitemap: `astro.config.ts` `sitemap.customPages` com lista vinda da API em build
- [ ] **B9**. Mover os 6 `.astro` originais para `frontend-public/src/_legacy/blog/` (preserva ref)
- [ ] **B10**. `Base.astro`: adicionar suporte a analytics IDs vindos da API (GA4/Clarity/Pixel/GTM)
- [ ] **B11**. `[CHECKPOINT]` `npm run build` + visual diff dos 6 posts vs. versão estática

## Etapa C — UIs admin

- [ ] **C1**. `[P]` Backend: `GET /api/v1/leads` com filtros (`from`, `to`, `source`, `q`) + paginação
- [ ] **C2**. `[P]` Backend: `GET /api/v1/leads/export.csv` (CSV RFC 4180 com BOM UTF-8)
- [ ] **C3**. `[P]` Frontend admin: feature `leads/` (api hooks, LeadsListPage, LeadFilters, ExportButton)
- [ ] **C4**. Rota `/admin/leads` + entrada na sidebar
- [ ] **C5**. `[P]` Backend: `GET/PATCH /api/v1/settings` com Zod (regex de IDs)
- [ ] **C6**. `[P]` Frontend admin: feature `settings/` com tabs (Geral / Analytics / Integrações)
- [ ] **C7**. Rota `/admin/settings` + entrada na sidebar
- [ ] **C8**. `[P]` Backend: `POST /api/v1/categories`, `PATCH /:id`, `DELETE /:id` (409 se posts vinculados)
- [ ] **C9**. `[P]` Frontend admin: feature `categories/` (CategoriesListPage + CategoryDialog)
- [ ] **C10**. Rota `/admin/categories` + entrada na sidebar
- [ ] **C11**. `[P]` Backend: `PATCH /api/v1/posts/:id/auto-save` (mesmo body, não muda status)
- [ ] **C12**. `[P]` Frontend admin: hook `useAutoSave(postId, formData, { debounceMs: 5000 })`
- [ ] **C13**. PostEditorPage: integrar auto-save + indicador visual ("Salvando…/Salvo HH:MM/Erro")

## Etapa D — Polimento (opcional)

- [ ] **D1**. `[opcional]` BullMQ assíncrono para IA: `POST /ai/generate-post` retorna `jobId`
- [ ] **D2**. `[opcional]` SSE/polling de progresso (`GET /ai/jobs/:id`)
- [ ] **D3**. `[opcional]` AIPanel front: barra de progresso + cancelar
- [ ] **D4**. `[opcional]` Storybook stories: Button, Input, Card, Badge, Select, KpiCard, PostStatusBadge, PostFilters

## Encerramento

- [ ] **Z1**. Atualizar `docs/specs/_active/2026-05-02-q2-blog-backoffice/status.md` com fase = validate
- [ ] **Z2**. Atualizar `MEMORY.md` (memory `project_aumaf3d.md` e `project_q2_backoffice.md`)
- [ ] **Z3**. Atualizar `INDEX.md` da pasta de specs
- [ ] **Z4**. `[CHECKPOINT]` Pull request com checklist de validações
- [ ] **Z5**. Após merge: mover spec para `_completed/` e escrever `retrospective.md`
