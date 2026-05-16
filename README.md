# AUMAF 3D

Site institucional, blog e backoffice da **AUMAF 3D Printing a New World Ltda** (São Carlos – SP), empresa de impressão 3D profissional. Monorepo TypeScript com três aplicações, pipeline de analytics próprio, conformidade LGPD e otimização SEO + GEO para Google e LLMs.

> Desenvolvido por [kayoridolfi.ai](https://kayoridolfi.ai). Para a visão de produto, contratos e checkpoints comerciais, ver `CLAUDE.md`.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend API | Node.js 18 · Express · Prisma · PostgreSQL 16 |
| Site público | Astro 5 · Tailwind CSS (SSR + prerender híbrido) |
| Backoffice | React 18 · Vite · Tailwind · Radix UI |
| Shared | `@aumaf/shared` — Zod schemas · `@aumaf/analytics-sdk` |
| Cache / filas | Redis 7 · BullMQ |
| Storage | MinIO (dev) / S3 (prod) |
| Auth · Authz | JWT em cookie httpOnly · CASL |
| Observabilidade | Pino · Sentry · `/health` agregado |
| Testes | Jest (back) · Vitest + Playwright + Storybook (front) |
| Infra | Docker Compose · Caddy (reverse proxy + TLS) · Hostinger VPS |

## Arquitetura

```
aumaf-3d-site/
├── backend/              # Express + Prisma + BullMQ
├── frontend-public/      # Astro 5 — site público (SSR híbrido)
├── frontend-admin/       # React 18 + Vite — backoffice
├── packages/
│   ├── shared/           # @aumaf/shared — Zod schemas
│   └── analytics-sdk/    # @aumaf/analytics-sdk — tracking client
├── deploy/               # Dockerfiles · Caddy · compose · runbooks
├── docs/                 # ADRs · plans · runbooks · playbooks · specs
├── scripts/              # smoke-test · LGPD · analytics audits
├── .github/workflows/    # CI · CD · migrate-posts
└── docker-compose.yml    # Postgres · Redis · MinIO (dev)
```

## Quickstart

Pré-requisitos: Node 18 (ver `.nvmrc`), npm 11, Docker + Docker Compose.

```bash
# 1. instalar dependências (resolve todos os workspaces)
npm install

# 2. copiar env templates
cp backend/.env.example         backend/.env
cp frontend-public/.env.example frontend-public/.env
cp frontend-admin/.env.example  frontend-admin/.env

# 3. subir tudo (Docker + 3 apps)
npm run dev
```

URLs locais após `npm run dev`:

| Serviço | URL |
|---|---|
| Site público | http://localhost:4321 |
| Backoffice admin | http://localhost:5174 |
| API backend | http://localhost:3000 |
| Prisma Studio | http://localhost:5555 (`cd backend && npx prisma studio`) |
| MinIO Console | http://localhost:9000 |
| Storybook | http://localhost:6006 (`cd frontend-admin && npm run storybook`) |

## Scripts principais

| Comando | Função |
|---|---|
| `npm run dev` | Sobe Docker + backend + 2 frontends em paralelo |
| `npm run dev:backend` · `:public` · `:admin` · `:db` | Workspaces isolados |
| `npm run build` | `turbo build` em todos os workspaces |
| `npm run lint` · `typecheck` · `test` | Turbo pipelines |
| `npm run test:e2e` | Playwright (frontend-admin) |
| `cd backend && npx prisma migrate dev` | Aplicar migrations |
| `cd backend && npx prisma db seed` | Popular banco |
| `./scripts/smoke-test.sh` | Smoke test geral |
| `./scripts/lgpd-smoke.sh` | Smoke LGPD (consent, DSR, retenção) |

## Pilares do projeto

### SEO + GEO (Google + LLMs)
Schemas JSON-LD canônicos em `frontend-public/src/lib/schemas.ts` (Organization, LocalBusiness, Product, Person, HowTo, Service, FAQPage, BreadcrumbList, DefinedTermSet, BlogPosting, ItemList). Conteúdo como dado em `frontend-public/src/data/*.ts`, exposto também em `.md` cru para LLMs (`/faq.md`, `/glossario.md`, `/servicos.md`, `/materiais.md`) e indexado em `/llms.txt`. IndexNow integrado ao `publishPost` do backend. Plano-mestre em `docs/plans/2026-05-14-maximize-organic-presence.md`. **Toda nova página pública DEVE usar a skill `seo-geo-content`.**

### Analytics próprio
Pipeline 100% AUMAF rodando em paralelo com GA4 / Clarity / Pixel. SDK em `packages/analytics-sdk/`, ingestão em `POST /v1/analytics/collect` → BullMQ → PostgreSQL → roll-up a cada 30 min. Catálogo canônico em `packages/shared/src/schemas/analytics.ts`. Dashboard em `/analytics` no admin. ADR-003 + runbook `docs/runbooks/analytics.md`. **Todo CTA novo DEVE usar a skill `analytics-tagging`.**

### LGPD
Conformidade end-to-end: políticas públicas em `docs/legal/`, ROPA / LIA / DPA / incident-response em `docs/compliance/`, banner consent (Consent Mode v2), endpoint `/v1/consent`, fluxo DSR com magic link 24h, worker BullMQ de retenção (analytics 12 m / leads anonimizados 5 a). Encarregado: Luiz Felipe Risse <felipe@aumaf3d.com.br>. Runbook em `docs/runbooks/lgpd-operations.md`.

### Segurança — defesa em profundidade
Todas as novas superfícies devem seguir `docs/decisions/ADR-004-security-defense-in-depth.md`: sanitização de HTML via `renderPostContent()` (sanitize-html), ownership check via `assertCan*()`, redaction de PII/secrets em `backend/src/config/logger.ts:REDACT_PATHS`, eventos analytics whitelisted em `ANALYTICS_EVENT_NAMES`, JWT sempre em cookie httpOnly. `npm audit --audit-level=high` deve passar antes do merge.

## Documentação

- **[CLAUDE.md](CLAUDE.md)** — contexto do projeto, contrato, checkpoints, regras críticas (raiz)
- **[docs/](docs/README.md)** — ADRs, plans, runbooks, playbooks, specs, design
- **[deploy/README.md](deploy/README.md)** — infra de produção (Caddy, Docker Compose, VPS Hostinger)
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — fluxo de trabalho, commits, PRs, skills
- **[SECURITY.md](SECURITY.md)** — política de segurança e divulgação responsável

## Status (mai/2026)

| Quinzena | Entrega | Status |
|---|---|---|
| Q1 | Site público navegável + design aprovado + infra | ✅ |
| Q2 | Blog funcional + backoffice + IA gerando posts | ✅ |
| Q3 | BullMQ + Storybook + QA + handover; deploy + Botyio | ✅ Foundation entregue |
| Org. Presence | Schemas, .md cru, IndexNow, 4 guias HowTo, 5 landings setoriais | ✅ Lotes 1+2+3 em produção |
| LGPD | Banner, consent, DSR, retenção, políticas | ✅ Em produção |

Produção: <https://aumaf3d.com.br>.

## Licença

Proprietário — © AUMAF 3D Printing a New World Ltda (CNPJ 46.357.355/0001-33). Todos os direitos reservados. Código-fonte mantido por kayoridolfi.ai sob contrato.
