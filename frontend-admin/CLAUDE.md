# Frontend Admin — Backoffice AUMAF 3D

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
├── pages/       # rotas (React Router ou TanStack Router)
├── features/    # módulos por domínio (blog, leads, settings...)
├── components/  # componentes compartilhados + Storybook stories
├── hooks/       # custom hooks
├── stores/      # Zustand stores
├── lib/         # axios instance, utils
└── test/        # setup vitest
```

## Módulos Planejados
- **Auth** — login, roles (Editor, Marketing, Admin)
- **Blog** — CRUD posts, editor Tiptap, agendamento, aprovação IA
- **Leads** — listagem, filtros, exportação CSV
- **Integrações** — GA4, Clarity, Pixel, GTM, tags customizadas
- **Configurações** — textos globais, WhatsApp/Botyo

## Padrões
- TanStack Query para server state, Zustand para UI state
- React Hook Form + Zod em todos os formulários
- Radix UI + Tailwind para componentes (a11y out-of-the-box)
- Storybook obrigatório para todos os componentes de design system
- E2E com Playwright em `e2e/`
