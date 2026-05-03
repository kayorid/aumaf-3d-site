# Frontend Admin — Backoffice AUMAF 3D

## ⚠️ Design system — REGRA ABSOLUTA

O backoffice **DEVE seguir o mesmo design system do `frontend-public`** — *Cinematic Additive Manufacturing*. Sem exceções, sem variantes "modernas" ou "neutras" para o admin.

**Antes de criar qualquer tela ou componente novo, leia:**
1. `docs/design/admin-design-system.md` — guia aplicado ao admin (canônico)
2. `docs/design/plano-design-completo.md` — catálogo completo de tokens e utilities (1033 linhas)
3. Memory: `project_design_system.md`

**Princípios não negociáveis** (resumo):
- Fundo `#000000`; verde neon (`#61c54f`) só em ação/status/link ativo
- Tipografia: **Space Grotesk** (única) + **Pirulen** apenas para o lockup "AUMAF 3D"
- Cantos sharp por padrão (`rounded-sm` / 1-2px); `rounded-lg` só em cards grandes
- Headlines em UPPERCASE; labels uppercase + `tracking-[0.2em]`
- CTAs primários: verde com `glow-effect`
- Status indicators com `dot-glow` + `animate-pulse-dot`
- Glass panels com `backdrop-blur` em modals e drawers
- Atmospheric green glows + `bg-tech-grid` em telas full-page
- Lucide React para ícones (estilo outline equivalente ao Material Symbols do público)

**Anti-padrões proibidos**: `bg-white`, fontes Inter/Roboto, `rounded-2xl+`, gradientes coloridos azul/roxo, verde em texto corrido.

Tokens já configurados em `tailwind.config.ts`. Utilities essenciais em `src/index.css` (`glass-panel`, `bg-tech-grid`, `glow-effect`, `pill`, `input-underline`, `text-gradient-green`, `dot-glow`, `surface-card`, etc.).

---

## Comandos

```bash
npm run dev          # vite → http://localhost:5174
npm run build        # vite build
npm run test         # vitest
npm run storybook    # storybook → http://localhost:6006
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run test:e2e     # playwright (requer build ou dev rodando)
```

## Estrutura

```
frontend-admin/src/
├── routes.tsx       # React Router v6 — rotas com AuthGuard
├── main.tsx         # bootstrap (QueryClient + Router + Sonner)
├── lib/             # api (axios), query-client, utils
├── stores/          # Zustand (auth.store)
├── components/
│   ├── layout/      # AdminShell, Sidebar, Topbar, LoadingScreen, NotFoundPage
│   └── ui/          # primitivos (Button, Input, Label, Card, Badge, Select)
├── features/
│   ├── auth/        # login + AuthGuard + hooks (api, components, pages)
│   ├── dashboard/   # 4 KPIs + listas recentes
│   ├── posts/       # CRUD + lista + editor page
│   ├── editor/      # MarkdownEditor (Tiptap dual + converters) + Renderer + MediaPicker
│   └── ai/          # AIPanel + use-generate-post
└── test/            # setup vitest
```

## Módulos planejados

- **Auth** ✅ Phase 1 — login JWT cookie httpOnly, AuthGuard, AdminShell
- **Dashboard** ✅ Phase 1 — 4 KPIs DB-only + lists
- **Blog/Posts** ✅ Phase 1 — CRUD + editor Markdown dual-mode + IA multi-provedor
- **WYSIWYG** ✅ Phase 2 — block editor inline com BlockPreview fiel ao DS
- **Leads** ✅ Phase 2 — listagem, filtros, exportação CSV
- **Integrações** ✅ Phase 2 — GA4, Clarity, Pixel, GTM (settings.routes)
- **Configurações** ✅ Phase 2 — textos globais, WhatsApp/Botyo
- **Storybook** ✅ Q3 — `npm run storybook` com tema Cinematic + a11y, Foundation/Tokens, stories de todos os primitivos UI + BlockPreview

## Padrões técnicos

- **TanStack Query v5** para server state (cache + invalidation declarativo)
- **Zustand** para UI state leve (auth.store)
- **React Hook Form + Zod** em todos os formulários
- **Radix UI primitives** + Tailwind para componentes a11y
- **Sonner** para toasts (configurado em `main.tsx`)
- **TipTap** + extensions para editor (sempre em modo dual com `MarkdownEditor`)
- Schemas compartilhados via `@aumaf/shared` (Zod)
- Storybook **obrigatório** para componentes de design system novos
- E2E **obrigatório** com Playwright em `e2e/` para fluxos críticos
- JWT **sempre** em cookie httpOnly (nunca localStorage)
- Markdown como formato de persistência (não HTML)

## Variáveis de ambiente

```bash
VITE_API_URL=http://localhost:3000/api/v1   # backend
```

## Login dev

```
admin@aumaf.com.br / AumafAdmin2026!  (do backend/.env)
```
