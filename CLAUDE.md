# AUMAF 3D — Contexto do Projeto

## O Projeto
Site institucional + Blog + Backoffice para **AUMAF 3D** (São Carlos – SP), empresa de impressão 3D profissional. Desenvolvido por **kayoridolfi.ai** como freelancer.

**Contrato:** R$ 3.500 (50% entrada + 50% entrega) + R$ 150/mês manutenção  
**Prazo:** 3 quinzenas (~1,5 mês)  
**Repositório:** https://github.com/kayorid/aumaf-3d-site

## Comandos Essenciais

```bash
# Subir tudo (Docker + backend + frontends)
npm run dev

# Workspaces individuais
npm run dev:backend       # API → http://localhost:3000
npm run dev:public        # Astro → http://localhost:4321
npm run dev:admin         # Vite/React → http://localhost:5174

# Infra Docker apenas
npm run dev:db            # PostgreSQL :5432, Redis :6379, MinIO :9000

# Qualidade
npm run build             # turbo build (todos os workspaces)
npm run lint              # turbo lint
npm run typecheck         # turbo typecheck
npm run test              # turbo test (unit)
npm run test:e2e          # Playwright (frontend-admin)

# Backend
cd backend && npx prisma studio        # UI do banco → :5555
cd backend && npx prisma migrate dev   # Aplicar migrations
cd backend && npx prisma db seed       # Popular banco

# Storybook
cd frontend-admin && npm run storybook  # → http://localhost:6006
```

## Arquitetura

```
aumaf-3d-site/
├── backend/              # Node.js + Express + Prisma + PostgreSQL
├── frontend-public/      # Astro 5 + Tailwind — site público (SSG/SSR)
├── frontend-admin/       # React 18 + Vite + Tailwind — backoffice
├── packages/
│   └── shared/           # @aumaf/shared — schemas Zod compartilhados
├── docs/
│   ├── plans/            # Planos de implementação por fase
│   ├── research/         # Pesquisa de conteúdo e referências
│   ├── design/           # Design system, tokens, referências visuais
│   └── decisions/        # ADRs — decisões arquiteturais
├── assets/               # Contrato, plano de trabalho (PDF)
└── docker-compose.yml    # PostgreSQL 16, Redis 7, MinIO
```

## Stack

| Camada | Tech |
|---|---|
| Backend | Node.js 18 + Express + Prisma + PostgreSQL 16 |
| Frontend público | Astro 5 + Tailwind CSS |
| Frontend admin | React 18 + Vite + Tailwind + Radix UI |
| Shared | Zod schemas (`@aumaf/shared`) |
| Cache/Filas | Redis 7 + BullMQ |
| Storage | MinIO (dev) / S3 (prod) |
| Auth | JWT em cookie httpOnly |
| Autorização | CASL |
| Testes BE | Jest |
| Testes FE | Vitest + Playwright + Storybook |
| Monitoramento | Pino + Sentry |

## Regras Críticas

- **Sem multi-tenancy** — sem `tenantId` em nenhum lugar do schema Prisma
- **Storybook obrigatório** — nunca remover mesmo sob pressão de prazo
- **Playwright obrigatório** — E2E no frontend-admin
- **MinIO obrigatório** — upload de imagens do blog
- **SEO/GEO obrigatório em conteúdo público** — toda nova página/seção do frontend-public DEVE usar a skill `seo-geo-content` (schemas JSON-LD + `src/data/*.ts` + `.md` source quando aplicável + entrada em `llms.txt`). Sem essa disciplina, conteúdo bom fica invisível para Google + LLMs.
- **Defesa em profundidade** — toda nova superfície DEVE seguir `docs/decisions/ADR-004-security-defense-in-depth.md`:
  - HTML de banco/usuário → `renderPostContent()` (DOMPurify)
  - PATCH/DELETE em recurso de usuário → `assertCan*()` com ownership check
  - Logs com PII/secrets → registrar path em `backend/src/config/logger.ts:REDACT_PATHS`
  - Eventos analytics novos → adicionar a `ANALYTICS_EVENT_NAMES` antes de disparar
  - PII em `analytics_events.properties` → proibido (usar `leadId`/`postId`)
  - `npm audit --audit-level=high` deve passar antes do merge para master
- JWT **sempre** em cookie httpOnly, nunca em localStorage
- Imports do `@aumaf/shared` devem vir de `packages/shared/src`

## Checkpoints do Projeto

| Quinzena | Entrega | Status |
|---|---|---|
| Q1 (sem 1–2) | Site público navegável + design aprovado + infra ativa | ✅ Concluído |
| Q2 (sem 3–4) | Blog funcional + backoffice + IA gerando posts | ✅ Concluído |
| Q3 (sem 5–6) | BullMQ + Storybook + QA + handover; deploy + Botyo separados | 🟡 Foundation entregue; deploy/Botyo aguardam |

## Q3 Foundation (entregue em `feat/q3-foundation`)

- **BullMQ + workers**: `lead-notification` (email ao admin) e `post-publish-cache` (warm-up SSR Astro). Health endpoint `/health` agrega DB/Redis/queues.
- **Storybook tematizado**: stories para todos os primitivos UI (`Button`, `Badge`, `Card`, `Input`, `Label`, `Select`, `KpiCard`), `BlockPreview` com 4 templates, página `Foundation/Tokens` com cores/tipografia/radii/shadows ao vivo.
- **Cobertura de testes**: 36 Jest backend + 35 Vitest admin + Playwright E2E (smoke + posts + leads + wysiwyg).
- **Ops**: `scripts/smoke-test.sh`, runbooks `local-development.md` e `operational-handover.md`.

## Integrações Previstas
- **Botyo** — WhatsApp chatbot + captação de leads
- **GA4 + Microsoft Clarity + Facebook Pixel + GTM** (em paralelo com o analytics próprio)
- **IA para posts** — geração automática SEO/GEO (provedor a definir pela AUMAF)

## Analytics próprio
Pipeline 100% AUMAF rodando em paralelo com GA4/Clarity. Dashboard em `/analytics` no admin.
- SDK: `packages/analytics-sdk/` — auto-tracking de `data-track`, scroll, form, time-on-page.
- Backend: `POST /v1/analytics/collect` → BullMQ → PostgreSQL → cron roll-up.
- Catálogo de eventos canônicos: `packages/shared/src/schemas/analytics.ts`.
- ADR: `docs/decisions/ADR-003-analytics-proprio.md` · Runbook: `docs/runbooks/analytics.md`.
- **Ao criar qualquer CTA/page/form novo, use a skill `analytics-tagging`.**

## SEO + GEO (Maximize Organic Presence)
Camadas técnica + conteúdo para Google + LLMs. Plano-mestre: `docs/plans/2026-05-14-maximize-organic-presence.md`.
- **Schemas JSON-LD**: factories em `frontend-public/src/lib/schemas.ts` (organization, localBusiness, product, person, howTo, service, faqPage, breadcrumb, definedTermSet, blogPosting, itemList). Cada página chama via `schemas={[...]}` prop do Base.
- **Conteúdo como dados**: arrays canônicos vivem em `frontend-public/src/data/*.ts` (faqs, glossario, servicos, materiais, guias, industrias). Pages importam; isso permite reuso por scripts de geração e evita drift entre `.astro` e `.md`.
- **Markdown sources para LLMs**: `frontend-public/scripts/generate-llm-sources.ts` (tsx) gera `public/{faq,glossario,servicos,materiais}.md` no build. Rodado por `npm run build` (frontend-public) antes do `astro build`.
- **IndexNow**: `backend/src/services/indexnow.service.ts` faz ping push para Bing/Yandex no `publishPost`. Requer `INDEXNOW_KEY` (backend) + `PUBLIC_INDEXNOW_KEY` (frontend) em prod.
- **`llms.txt`**: índice canônico que LLMs consultam (`frontend-public/public/llms.txt`). Atualizar ao adicionar conteúdo novo.
- **Performance LCP**: páginas com bg hero em CSS devem passar `preloadImage="/images/bg-X.webp"` para `Base.astro`.
- **Ao adicionar página/seção pública nova, use a skill `seo-geo-content`.**

## LGPD / Privacidade
- Plano: `docs/plans/2026-05-12-lgpd-compliance-plan.md`
- Politicas publicas: `docs/legal/` → publicadas em `/politica-de-privacidade`, `/termos-de-uso`, `/politica-de-cookies`
- Operacao interna: `docs/compliance/` (ROPA, LIA, incident-response, DPA)
- Encarregado: Luiz Felipe Lampa Risse — felipe@aumaf3d.com.br
- Banner consent: `frontend-public/src/components/CookieConsent.astro` (versao 1.0)
- Loader consent-aware (GA4/Clarity/Pixel/GTM): `frontend-public/src/scripts/third-party-loader.ts` (Consent Mode v2 default denied)
- Endpoint consent: `POST /api/v1/consent` → `consent_logs`
- DSR (direitos do titular, art. 18): `POST /api/v1/dsr/request` → magic link 24h → admin `/lgpd/solicitacoes`
- Worker retencao: `backend/src/workers/data-retention.worker.ts` (diario 03:00 BRT — analytics 12m / leads anon 5a / consents 5a / DSR completed 5a)
- Smoke test: `./scripts/lgpd-smoke.sh` (BASE_URL + API_URL)
- Runbook operacional: `docs/runbooks/lgpd-operations.md`

## URLs Locais

| Serviço | URL |
|---|---|
| Frontend público | http://localhost:4321 |
| Frontend admin | http://localhost:5174 |
| Backend API | http://localhost:3000 |
| MinIO Console | http://localhost:9000 |
| Prisma Studio | http://localhost:5555 |
| Storybook | http://localhost:6006 |

## Rotas públicas (frontend-public)

Institucionais: `/`, `/servicos`, `/sobre`, `/contato`, `/avaliacoes`, `/portfolio`, `/blog`, `/blog/[slug]`.
Catálogo & referência: `/materiais` (19 materiais com productSchema), `/glossario` (32 termos com DefinedTermSet).
Conversão & funil: `/faq` (54 perguntas), `/guias` + `/guias/[slug]` (4 HowTos), `/industrias` + `/industrias/[slug]` (5 setores com Service+FAQPage).
LGPD: `/politica-de-privacidade`, `/termos-de-uso`, `/politica-de-cookies`, `/preferencias-de-cookies`.
LLM sources: `/llms.txt`, `/llms-full.txt`, `/faq.md`, `/glossario.md`, `/servicos.md`, `/materiais.md`, `/<INDEXNOW_KEY>.txt`.

## Docs do Projeto
- `docs/research/site-atual-conteudo.md` — scraping completo do site Wix atual
- `docs/plans/2026-05-02-project-scaffold.md` — plano de scaffold executado
- `docs/design/` — design system em construção (Q1)
