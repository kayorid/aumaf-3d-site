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

## Próximo marco esperado

**Q2 — Blog funcional + backoffice + IA gerando posts**  
Início: semana de 2026-05-05  
Spec: a criar em `_active/2026-05-05-q2-blog-backoffice/`
