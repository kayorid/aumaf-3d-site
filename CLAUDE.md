# Multi-Brand Site Template — Contexto do Projeto

## O que é este repositório

Boilerplate full-stack para sites institucionais com blog, captação de leads e backoffice administrativo. Destilado do projeto AUMAF 3D, agora reutilizável para múltiplas marcas.

**Toda identidade vive em `packages/shared/src/template/config.ts`** (alias raiz: `template.config.ts`). Toda paleta vive em `frontend-public/src/styles/themes/<theme>.css`. Nada de hardcode em componentes — sempre que precisar do nome/contato/URL, importe:

```ts
import { templateConfig } from '@template/shared'
```

## Comandos essenciais

```bash
# subir tudo (Docker + backend + 2 frontends)
npm run dev

# workspaces individuais
npm run dev:backend       # API → http://localhost:3000
npm run dev:public        # Astro → http://localhost:4321
npm run dev:admin         # Vite/React → http://localhost:5174

# infra Docker apenas
npm run dev:db            # PostgreSQL :5432, Redis :6379, MinIO :9000

# qualidade
npm run build             # turbo build
npm run lint              # turbo lint
npm run typecheck         # turbo typecheck
npm run test              # turbo test (unit)
npm run test:e2e          # Playwright (frontend-admin)

# backend
cd backend && npx prisma studio        # UI do banco → :5555
cd backend && npx prisma migrate dev   # aplicar migrations
cd backend && npx prisma db seed       # popular banco

# storybook
cd frontend-admin && npm run storybook  # → http://localhost:6006

# bootstrap de marca nova
npm run brand:init
```

## Arquitetura

```
.
├── packages/shared/        # @template/shared — Zod + TemplateConfig types
├── frontend-public/        # Astro 5 + Tailwind — site público (SSG/SSR)
├── frontend-admin/         # React 18 + Vite + Tailwind — backoffice
├── backend/                # Node 18 + Express + Prisma + Postgres
├── template.config.ts      # entry-point ergonômico (re-export do shared)
├── scripts/                # init-brand.mjs, smoke-test.sh
├── docs/
│   ├── template/           # REBRAND, THEMING, CONTENT, ARCHITECTURE
│   ├── design/             # design system
│   ├── plans/              # planos de implementação
│   └── decisions/          # ADRs
└── docker-compose.yml      # Postgres 16, Redis 7, MinIO
```

## Stack

| Camada | Tech |
|---|---|
| Backend | Node 18 + Express + Prisma + PostgreSQL 16 |
| Frontend público | Astro 5 + Tailwind CSS |
| Frontend admin | React 18 + Vite + Tailwind + Radix UI |
| Shared | Zod schemas + TemplateConfig (`@template/shared`) |
| Cache/Filas | Redis 7 + BullMQ |
| Storage | MinIO (dev) / S3 (prod) |
| Auth | JWT em cookie httpOnly |
| Autorização | CASL |
| Testes BE | Jest |
| Testes FE | Vitest + Playwright + Storybook |
| Monitoramento | Pino + Sentry |

## Regras críticas

- **Identidade nunca hardcoded.** Sempre `templateConfig.*`. Em `.astro`/`.tsx`, importe de `@template/shared`. Em `.ts` do backend, idem.
- **Cores nunca hardcoded.** Use os tokens Tailwind (`bg-primary`, `text-on-surface`, etc.) que apontam para CSS variables. Nunca escreva `#61c54f` ou `rgba(97,197,79,...)`. Se precisar de uma cor de marca, escreva `rgb(var(--color-primary-container) / 0.X)`.
- **Sem multi-tenancy** — sem `tenantId` no schema Prisma. O template é "uma marca por instância".
- **Storybook obrigatório** para componentes novos no admin.
- **Playwright obrigatório** para fluxos críticos no admin.
- **MinIO obrigatório** para upload de imagens do blog (dev). Em prod, S3.
- **JWT sempre** em cookie httpOnly, nunca em localStorage.
- **Imports do `@template/shared`** devem vir de `packages/shared/src` (alias configurado).

## Como adicionar / re-skinnar uma marca

Ver [`docs/template/REBRAND.md`](docs/template/REBRAND.md).

Em uma frase: edite `packages/shared/src/template/config.ts`, troque o `@import` do tema em `frontend-public/src/styles/global.css` e em `frontend-admin/src/index.css`, e remova/edite as páginas marcadas com `TEMPLATE DEMO PAGE`.

## Páginas vitrine — política de demo content

As seguintes páginas têm copy específica do setor original (impressão 3D) marcada com banner `TEMPLATE DEMO PAGE`:

- `frontend-public/src/pages/servicos.astro`
- `frontend-public/src/pages/materiais.astro`
- `frontend-public/src/pages/portfolio.astro`
- `frontend-public/src/pages/sobre.astro`
- `frontend-public/src/pages/faq.astro`
- `frontend-public/src/pages/avaliacoes.astro`

Estas páginas servem como **scaffolds visuais** — substitua textos, imagens e seções pela proposta da sua marca. A estrutura visual é reaproveitável.

## URLs locais

| Serviço | URL |
|---|---|
| Frontend público | http://localhost:4321 |
| Frontend admin | http://localhost:5174 |
| Backend API | http://localhost:3000 |
| MinIO Console | http://localhost:9000 |
| Prisma Studio | http://localhost:5555 |
| Storybook | http://localhost:6006 |

## Docs do projeto

- [`README.md`](README.md) — overview do template
- [`docs/template/REBRAND.md`](docs/template/REBRAND.md) — passo-a-passo de rebrand
- [`docs/template/THEMING.md`](docs/template/THEMING.md) — como criar/editar temas
- [`docs/template/CONTENT.md`](docs/template/CONTENT.md) — guia das páginas (genéricas vs. demo)
- [`docs/template/ARCHITECTURE.md`](docs/template/ARCHITECTURE.md) — visão técnica detalhada
