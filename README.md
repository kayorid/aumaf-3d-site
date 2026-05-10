# Multi-Brand Site Template

Boilerplate full-stack para criar sites institucionais com blog, captação de leads e backoffice administrativo. Desenhado para ser re-skinnado rapidamente para múltiplas marcas, com todo o design system tokenizado e identidade institucional centralizada em um único arquivo de configuração.

> **Origem:** este template foi destilado do site da AUMAF 3D (manufatura aditiva, São Carlos – SP). Toda a infraestrutura técnica, todos os fluxos de admin e todo o design system são reutilizáveis. A copy específica de impressão 3D ficou nas páginas vitrine como **demo content**, marcada com banner `TEMPLATE DEMO PAGE`.

---

## O que vem dentro

- **Site público** (Astro 5 + Tailwind) — home, blog, portfolio, serviços, materiais, sobre, FAQ, avaliações Google, contato. SSR + prerender seletivo. SEO completo (sitemap dinâmico, schema.org, OG, breadcrumbs).
- **Backoffice** (React 18 + Vite + Tailwind + Radix) — CRUD de posts com editor WYSIWYG, IA multi-provedor para geração de posts, gestão de leads, mídia, usuários/permissões (CASL), configurações de integrações (GA4, Clarity, Pixel, GTM, Botyo).
- **Backend** (Node 18 + Express + Prisma + PostgreSQL) — JWT em cookie httpOnly, validação com Zod compartilhado, workers BullMQ (notificação de leads, warmup de cache pós-publish), Storybook obrigatório para novos componentes.
- **Infraestrutura local** — Docker Compose com Postgres 16, Redis 7 e MinIO. `npm run dev` sobe tudo.
- **Qualidade** — Jest (backend), Vitest (admin), Playwright (E2E admin), Storybook (admin DS).

## Stack

| Camada | Tech |
|---|---|
| Frontend público | Astro 5 + Tailwind CSS |
| Frontend admin | React 18 + Vite + Tailwind + Radix UI + TanStack Query |
| Backend | Node 18 + Express + Prisma + PostgreSQL 16 |
| Shared | Zod schemas + `templateConfig` em `@template/shared` |
| Cache / Filas | Redis 7 + BullMQ |
| Storage | MinIO (dev) / S3 (prod) |
| Auth / Authz | JWT (cookie httpOnly) + CASL |
| Tests | Jest + Vitest + Playwright + Storybook |
| Observability | Pino + Sentry-ready |

---

## Quick start

```bash
# 1) Pré-requisitos: Node 18+, Docker, npm 11+
nvm use         # respeita .nvmrc
npm install

# 2) Variáveis de ambiente
cp backend/.env.example backend/.env
# edite ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET (>=32 chars), DATABASE_URL etc.

# 3) Suba tudo
npm run dev
# → frontend público   http://localhost:4321
# → frontend admin     http://localhost:5174
# → backend API        http://localhost:3000
# → Postgres :5432, Redis :6379, MinIO :9000

# 4) Migrar e seedar o banco (uma vez)
cd backend
npx prisma migrate dev
npx prisma db seed
```

Login dev: o seed cria o usuário admin com as credenciais definidas em `backend/.env`.

---

## Re-skin para uma nova marca

Dois caminhos:

**Caminho rápido — bootstrap interativo:**

```bash
npm run brand:init
```

Esse comando pergunta nome da marca, slug, e-mail, WhatsApp, escolha de tema, e aplica tudo automaticamente. Veja [`docs/template/REBRAND.md`](docs/template/REBRAND.md).

**Caminho manual — edição direta:**

1. Edite [`packages/shared/src/template/config.ts`](packages/shared/src/template/config.ts) — esse é o **único arquivo** com identidade (nome, NAP, contato, social, navegação, SEO, features).
2. Escolha um tema em `frontend-public/src/styles/themes/` (`industrial-green`, `ocean-blue`, `warm-boutique`) e atualize o `@import` em:
   - `frontend-public/src/styles/global.css`
   - `frontend-admin/src/index.css`
3. (Opcional) Substitua os scaffolds em `frontend-public/src/pages/` marcados com `TEMPLATE DEMO PAGE` pela copy da sua marca.

Não toque em código de componentes — toda a UI lê do `templateConfig`.

---

## Estrutura do repositório

```
.
├── packages/shared/        # @template/shared — Zod schemas + TemplateConfig
├── frontend-public/        # Astro 5 — site público
├── frontend-admin/         # React + Vite — backoffice
├── backend/                # Node + Express + Prisma
├── template.config.ts      # ENTRY POINT da config de marca (re-export ergonômico)
├── docs/
│   ├── plans/              # planos de implementação
│   ├── template/           # guias do template (REBRAND, THEMING, CONTENT)
│   ├── design/             # design system (Cinematic Additive Manufacturing)
│   └── decisions/          # ADRs
├── scripts/                # init-brand, smoke-test, etc.
└── docker-compose.yml      # PostgreSQL + Redis + MinIO
```

---

## Documentação

| Doc | Quando ler |
|---|---|
| [`docs/template/REBRAND.md`](docs/template/REBRAND.md) | Para fazer rebrand. Passo-a-passo do `brand:init` ao deploy. |
| [`docs/template/THEMING.md`](docs/template/THEMING.md) | Para criar ou ajustar um tema visual. |
| [`docs/template/CONTENT.md`](docs/template/CONTENT.md) | Para entender quais páginas são scaffolds (demo) vs. quais são genéricas. |
| [`docs/template/ARCHITECTURE.md`](docs/template/ARCHITECTURE.md) | Para entender as escolhas técnicas e a topologia da stack. |

---

## Comandos essenciais

```bash
# desenvolvimento
npm run dev              # Docker + backend + 2 frontends
npm run dev:public       # apenas Astro
npm run dev:admin        # apenas admin
npm run dev:backend      # apenas API
npm run dev:db           # apenas Docker (PG + Redis + MinIO)

# qualidade
npm run build            # turbo build (todos)
npm run lint             # turbo lint
npm run typecheck        # turbo typecheck
npm run test             # turbo test (unit)
npm run test:e2e         # Playwright (admin)

# tooling
npm run brand:init       # bootstrap interativo de nova marca
cd backend && npx prisma studio        # UI do banco
cd frontend-admin && npm run storybook # Storybook do DS
```

---

## Filosofia

Este template tenta seguir três princípios rígidos:

1. **Tudo lê de um lugar só.** `templateConfig` é a única fonte de verdade institucional. Nenhum componente acessa hardcode.
2. **Trocar tema = um import.** O Tailwind do public e do admin leem de CSS variables. Variáveis vivem em `frontend-public/src/styles/themes/<theme>.css`. Mude o `@import`, mude a aparência.
3. **Honestidade sobre demo content.** Páginas com copy super específica (serviços de impressão 3D, materiais técnicos, casos de uso) ficam marcadas com `TEMPLATE DEMO PAGE`. O template não pretende escrever sua marca por você — ele entrega a estrutura impecável.

---

## Licença

Definida pelo proprietário do clone. Por padrão, este template é privado.
