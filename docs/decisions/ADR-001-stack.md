# ADR-001 — Stack Tecnológica

**Data:** 2026-05-02  
**Status:** Aceito

## Decisão
Monorepo npm workspaces + Turbo com três apps: backend Express, frontend-public Astro, frontend-admin React/Vite.

## Justificativa
- Stack dominada pelo time (kayoridolfi.ai), reduz risco de prazo
- Astro ideal para site público (SSG + performance Core Web Vitals)
- React/Vite ideal para backoffice SPA com estado complexo
- Monorepo permite compartilhar schemas Zod entre backend e frontends

## Restrições Confirmadas
- **Sem multi-tenancy** — projeto single-tenant, sem `tenantId`
- **Storybook obrigatório** — documentação de componentes
- **Playwright obrigatório** — E2E no admin
- **MinIO obrigatório** — storage de imagens do blog
