# HISTORY — AUMAF 3D

> Log cronológico de marcos do projeto. Cada feature concluída ganha entrada aqui. Para narrativa detalhada, ver `_completed/<slug>/retrospective.md`.

---

## 2026-05-02 — Q1: Site Público Navegável + Design System

**Commit**: `bb9269e`  
**Spec**: [_completed/2026-05-02-q1-site-publico/](_completed/2026-05-02-q1-site-publico/)  
**Resumo**: Monorepo scaffoldado do zero, infra Docker ativa, backend Express/Prisma configurado, todas as 10 páginas do site público implementadas com design system Cinematic Additive Manufacturing completo. Build limpo, typecheck limpo.

**Entregues nesta fase**:
- Monorepo npm workspaces + Turbo (backend, frontend-public, frontend-admin, @aumaf/shared)
- PostgreSQL 16 + Redis 7 + MinIO via Docker Compose
- Schema Prisma: User, Post, Category, Lead, Setting
- Storybook + Playwright E2E + Vitest configurados no admin
- Design system Cinematic: tokens Tailwind, glassmorphism, tech-grid, animações
- Componentes: Navbar.astro, Footer.astro
- 10 páginas: /, /servicos, /sobre, /contato, /faq, /materiais, /portfolio, /blog, /blog/[slug], sitemap

---

## 2026-05-03 — Q2 Phase 1: Plano detalhado de backoffice aprovado

**Spec**: [_active/2026-05-02-q2-blog-backoffice/](_active/2026-05-02-q2-blog-backoffice/)
**Resumo**: Spec de Q2 dividida em duas iterações. Phase 1 cobre auth + dashboard com métricas DB + posts CRUD + IA multi-provedor (Anthropic/OpenAI/Gemini com interface comum). Design e tasks completos (15 fases F1-F15, ~60 tasks). Restrição absoluta: não tocar `frontend-public/` nesta iteração — migração do `/blog` é Phase 2.

**Decisões chave registradas**:
- Multi-provedor IA com seleção runtime (env default + override por requisição)
- Geração síncrona com timeout 90s (BullMQ vai para Phase 2 se necessário)
- Workflow 2 estados na UI (Draft/Published); aprovação = humano revisar rascunho IA
- TipTap + React Router v6 + TanStack Query v5 + Zustand no admin
- Upload via presigned URL direto no MinIO (cliente faz PUT)
- Dashboard DB-only (GA4 fica para Phase 2)

---

## 2026-05-03 — Polimento UX/A11y/SEO/GEO do front-public

**Spec**: [_active/2026-05-03-frontend-public-uxa11y-seo-geo/](_active/2026-05-03-frontend-public-uxa11y-seo-geo/)
**Resumo**: Auditoria completa das 13 páginas do `frontend-public` (UX, WCAG 2.2 AA, SEO técnico, GEO/AI search) seguida de implementação cirúrgica em 3 fases. Visual mantido idêntico; semântica, ARIA, contraste, schemas e microcopy refeitos.

**Entregues nesta fase**:
- Primitivas globais: `src/lib/company.ts` (NAP), `src/lib/schemas.ts` (Organization, LocalBusiness, WebSite, WebPage, BreadcrumbList, FAQPage, HowTo, BlogPosting, Service, ItemList), `src/components/SEO.astro` (`@graph` único por página), `src/components/Breadcrumb.astro`
- `public/robots.txt` permitindo AI crawlers (GPTBot, Claude, Perplexity, Google-Extended, etc.) + sitemap pointer
- `public/og/og-default.svg` com branding AUMAF 3D 1200×630
- `Base.astro` refatorado: skip-link, `<main id="main-content">`, schema `@graph` global, Material Symbols com `&display=swap`, theme-color, format-detection, favicon completo
- `global.css`: `:focus-visible` outline global, `@media (prefers-reduced-motion: reduce)` cobrindo todas as animações
- Páginas institucionais (`/`, `/sobre`, `/servicos`, `/contato`): contraste corrigido (white/X → tokens), `<main>` herdado, `<dl>` semântico, headings hierárquicos, `<time datetime>`, anchor text descritivo, formulário `/contato` totalmente acessível (labels associadas, `autocomplete`, `aria-describedby`, `role="radiogroup"`, `aria-busy`, validação inline com `role="alert"`)
- Listagens (`/portfolio`, `/materiais`, `/faq`, `/blog`): filter pills como `role="radiogroup"`/`radio` com setas de teclado, contador `aria-live`, estado vazio `<div hidden>`, `<ul role="list">` semântico, FAQ accordion completo (`aria-expanded` + `aria-controls` + `<region>` + `hidden`)
- Posts de blog (`[slug].astro` + 4 hardcoded): `BlogPosting` + `BreadcrumbList` schema, OG `article` com `og:image` específica, `<time datetime>`, share cluster (WhatsApp/LinkedIn/X/copy-link), Breadcrumb component, HowTo schema em `engenharia-reversa-passo-a-passo`
- `Navbar.astro`: `aria-current="page"`, focus-trap no drawer mobile + Esc para fechar, `aria-controls`, role=dialog
- `Footer.astro`: NAP via `COMPANY` const, `<address>` + `<nav aria-label>`, links externos com aviso de nova aba

**Validação**: build limpo (15 páginas), typecheck clean (0 errors/warnings, 1 hint inerte do Astro), schemas inspecionados — `/faq` com 14 Q+A em FAQPage, `/servicos` com 4 Service + HowTo, `/blog/<post>` com BlogPosting + Breadcrumb.

---

## 2026-05-03 — Q2 Phase 1: Backoffice básico funcional ✅

**Spec**: [_active/2026-05-02-q2-blog-backoffice/](_active/2026-05-02-q2-blog-backoffice/)
**Resumo**: Implementação completa da Phase 1 do backoffice em sessão única. Backend Express com auth JWT (cookie httpOnly + bcrypt), Posts CRUD, Categorias, Upload presigned MinIO, Leads (POST público + GET admin), IA multi-provedor (Anthropic/OpenAI/Gemini) com interface comum, métricas dashboard. Frontend admin React+Vite com Tailwind tokens AUMAF (cinematic dark), TanStack Query, React Router, Zustand. Editor Markdown dual-mode (Tiptap Visual + textarea Code) com conversores caseiros + react-markdown preview. Painel IA com escolha de provedor e parâmetros. Validação: build limpo (4/4), typecheck (5/5), Jest backend (12/12), Vitest admin (14/14), Playwright (3/3 chromium). Frontend público intocado (regra crítica respeitada).

**Entregue**:
- 7 endpoints backend públicos `/api/v1`: auth (login/logout/me), posts CRUD + publish/unpublish, categories, uploads/presign, leads, ai/generate-post, metrics/dashboard
- 3 providers IA implementados (Anthropic SDK, OpenAI SDK, Google GenAI SDK) atrás de interface `AIProvider`
- System prompt SEO/GEO em pt-BR com regras AUMAF (~1500 tokens, cacheável no Anthropic)
- 6 schemas Zod compartilhados em `@aumaf/shared`: auth, post, category, upload, ai, lead, metrics, api
- 5 páginas admin: LoginPage (split layout cinematic), DashboardPage (4 KPIs + 2 listas), PostsListPage (tabela + filtros), PostEditorPage (editor + tabs preview/edit + sidebar SEO + AIPanel), NotFoundPage
- MarkdownEditor (Tiptap visual + textarea code) com 12 extensions, toolbar completa, char counter, isUpdatingRef guard
- MarkdownRichRenderer com componentes Tailwind para headings/listas/tabelas/code/links a11y
- MediaPickerDialog drag-and-drop com upload via presigned URL + progress
- AIPanel: dropdown provedor, textarea tema, chips keywords, radio tom, slider tamanho, loading com timer

**Decisões chave**:
- Persistência em Markdown (não HTML) — IA gera direto, portátil, diff-friendly
- Conversores caseiros vs. marked/turndown (bundle menor, controle total)
- Sync (timeout 90s) ao invés de BullMQ — modelos modernos entregam <40s
- 2 estados na UI (DRAFT/PUBLISHED), PENDING_REVIEW dormente
- CASL omitido (1 admin único — check direto de role)
- SanitizedHtml omitido (sem HTML legado)

---

## Próximo marco esperado

**Q2 Phase 2 — Backoffice ampliado**
- UI de leads + filtros + export CSV
- UI de settings (analytics IDs)
- Migração `/blog` público para consumir API (Astro hybrid SSR)
- CRUD de categorias
- BullMQ assíncrono para IA (com SSE/polling)
- Auto-save no editor
