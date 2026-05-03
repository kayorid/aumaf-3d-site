# Retrospectiva — Q1: Site Público Navegável

**Feature**: q1-site-publico  
**Fase final**: retrospective  
**Concluída em**: 2026-05-02  
**Commit de entrega**: `bb9269e`  
**Duração efetiva**: ~1 sessão longa de desenvolvimento (scaffolding + design system + 10 páginas)

---

## O que foi entregue

- Monorepo npm workspaces + Turbo com 3 apps + 1 pacote shared
- Infra Docker: PostgreSQL 16, Redis 7, MinIO
- Backend Express + Prisma + schema completo (User, Post, Category, Lead, Setting)
- Frontend-admin scaffoldado com React 18 + Vite + Tailwind + Radix UI
- Storybook, Playwright E2E, Vitest configurados
- `@aumaf/shared` com schemas Zod
- Design system **Cinematic Additive Manufacturing**: tokens Tailwind, glassmorphism, tech-grid, animações
- Componentes: Navbar.astro (glass, mobile hamburger), Footer.astro (3 colunas)
- 10 páginas do site público — todas 200 OK, build limpo

## O que funcionou bem

- Decisão de usar Astro para o site público: build SSG rápido, performance nativa
- Design system como tokens Tailwind: consistência garantida, sem valores mágicos inline
- Scaffold completo antes de implementar qualquer página: evitou retrabalho de configuração
- `astro check` + `npm run build` como gate de qualidade desde o início

## O que foi difícil

- Configuração de aliases TypeScript entre workspaces (resolvido com `tsconfig paths` + Astro config)
- Integração do Vitest com `addon-vitest` no Storybook exigiu ajuste de configuração

## Dívida técnica identificada para Q2/Q3

- [ ] Responsividade mobile: revisar cada página em 375px, 390px, 430px
- [ ] Homepage: paralax sutil no scroll do hero
- [ ] Transições de página: fade entre rotas
- [ ] Animações de entrada: IntersectionObserver com stagger por item
- [ ] SEO on-page: meta descriptions específicas por página
- [ ] OG Images dinâmicas por página
- [ ] Formulário de contato: validação e envio real (backend)
- [ ] Blog: integração com CMS/backend real (Q2)
- [ ] Portfolio: galeria com imagens reais da AUMAF

## Decisões que ficaram abertas

- Cor de acento secundária além do verde `#61c54f` (aguardando feedback visual da AUMAF)
- Provedor de IA para geração de posts (aguardando decisão da AUMAF)
- Domínio de produção para deploy (Q3)

## Lições para próximas fases

1. **Começar specs de Q2 antes do kickoff da implementação** — usar esta estrutura SDD desde o início
2. **Checkpoint visual com o cliente** após primeiras páginas antes de implementar todas
3. **Mobile-first** no próximo ciclo — responsividade mobile como critério de aceitação, não pendência
