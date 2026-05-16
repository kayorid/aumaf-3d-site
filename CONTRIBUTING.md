# Contribuindo com o AUMAF 3D

Este repositório é privado e mantido por [kayoridolfi.ai](https://kayoridolfi.ai) sob contrato com a AUMAF 3D. Este guia documenta as convenções de trabalho usadas no monorepo.

## Fluxo padrão

1. **Branch** a partir de `master`: `feat/...`, `fix/...`, `chore/...`, `docs/...`, `perf/...`.
2. **Commit** seguindo Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `perf:`, `refactor:`). Mensagens em português.
3. **PR** para `master`. CI roda `lint + typecheck + test + build` — todos devem ficar verdes.
4. **Squash merge** com `gh pr merge <N> --squash --delete-branch`. Mensagem final = título do PR.
5. **CD** dispara automaticamente em push para `master` (`.github/workflows/cd.yml`) e faz deploy na VPS.

## Antes de abrir PR

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Para mudanças no backend que mexem em rotas, schema Prisma ou auth:

```bash
cd backend && npx prisma migrate dev   # se mexeu em schema.prisma
npm run test --workspace=backend       # Jest
```

Para mudanças no admin:

```bash
npm run test:e2e                       # Playwright
cd frontend-admin && npm run storybook # validar visualmente
```

Para mudanças no público (conteúdo / schemas SEO):

```bash
cd frontend-public && npm run build    # roda generate-llm-sources antes do astro build
```

## Regras críticas (não negociáveis)

- **Sem multi-tenancy** — nenhum `tenantId` no schema Prisma.
- **Defesa em profundidade** — toda nova superfície segue [ADR-004](docs/decisions/ADR-004-security-defense-in-depth.md). HTML de usuário/banco passa por `renderPostContent()`; mutações em recurso de usuário passam por `assertCan*()`; PII/secrets em logs vão para `REDACT_PATHS`; eventos novos entram em `ANALYTICS_EVENT_NAMES` antes de serem disparados.
- **JWT sempre em cookie httpOnly** — nunca em `localStorage`.
- **SEO/GEO obrigatório em conteúdo público** — toda página/seção nova do `frontend-public` usa a skill `seo-geo-content` (JSON-LD + `src/data/*.ts` + `.md` cru + entrada em `llms.txt`).
- **Analytics obrigatório em CTA/form/page** — toda nova superfície interativa usa a skill `analytics-tagging` (data-track + evento no catálogo canônico).
- **Storybook obrigatório no admin** — toda primitiva nova ganha story.
- **Playwright obrigatório no admin** — fluxos críticos cobertos por E2E.
- **`npm audit --audit-level=high` limpo** antes do merge para `master`.
- **Imports do `@aumaf/shared`** sempre via `packages/shared/src`, nunca caminho relativo entre workspaces.

## Skills do harness (Claude Code)

Este projeto é desenvolvido com assistência de IA e tem skills específicas. Sempre que aplicável, invocá-las:

| Skill | Quando usar |
|---|---|
| `seo-geo-content` | Nova página/landing/guia/FAQ/post pública |
| `analytics-tagging` | Novo CTA, botão, link de nav, form, modal ou página |
| `vps-deploy` | SSH em produção, deploy manual, rollback, debug de incidente |
| `spec-driven-development` | Spec antes de implementar feature não trivial |

## Estrutura de docs

- **Decisão arquitetural** → ADR sequencial em `docs/decisions/`. ADR aceito é imutável — supersede com novo.
- **Plano de entrega** → `docs/plans/YYYY-MM-DD-tema.md`. Ao concluir, mover para `plans/_completed/`.
- **Operação reproduzível em produção** → runbook em `docs/runbooks/` com pré-requisitos, comandos copiáveis e critério de sucesso.
- **Lição/contexto frequente** → memória do harness, não doc versionado.

Mais detalhes em [`docs/README.md`](docs/README.md).

## Convenções de PR

- Título conciso (< 70 chars) seguindo Conventional Commits.
- Descrição com **Summary** (1–3 bullets) e **Test plan** (checklist).
- Screenshots/GIFs em PRs de UI.
- Linkar ADRs, runbooks ou plans relevantes.
- Co-autoria do Claude no commit final (`Co-Authored-By:`) quando aplicável.

## Reportar vulnerabilidade

Ver [`SECURITY.md`](SECURITY.md).
