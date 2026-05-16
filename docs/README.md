# docs/ — Documentação AUMAF 3D

Esta pasta é a memória de longo prazo do projeto. Está organizada por **tipo de documento**, não por área funcional, para que cada artefato tenha um lugar previsível.

## Mapa rápido

| Pasta | Conteúdo | Quando consultar |
|---|---|---|
| [`decisions/`](decisions/) | ADRs — decisões arquiteturais imutáveis | Antes de mudar stack, segurança ou contrato de domínio |
| [`plans/`](plans/) | Planos de implementação por fase / lote | Para entender o porquê de uma entrega histórica ou planejar um novo lote |
| [`runbooks/`](runbooks/) | Procedimentos operacionais reproduzíveis | Em incidentes, deploys, restore, ativação de integrações |
| [`playbooks/`](playbooks/) | Receitas replicáveis para novos projetos | Ao iniciar um projeto análogo (ex.: outro site Astro) |
| [`research/`](research/) | Scraping, benchmarks, referências | Ao validar conteúdo ou estudar a concorrência |
| [`design/`](design/) | Design system, tokens, referências visuais | Ao criar/ajustar componentes públicos ou admin |
| [`compliance/`](compliance/) | ROPA, LIA, DPA, incident-response (LGPD interno) | Em auditorias, requisição da ANPD, incidente de dados |
| [`legal/`](legal/) | Políticas públicas (privacidade, termos, cookies) | Atualização das páginas `/politica-*` e `/termos-de-uso` |
| [`integrations/`](integrations/) | Especificações de integrações externas | Botyio, Featurable, GA4, Behold, IndexNow |
| [`perf/`](perf/) | Baselines e relatórios de performance | Bundle audit, Core Web Vitals, regressões |
| [`specs/`](specs/) | Specs ativas / completas (SDD) | Fluxo `spec-driven-development` |
| [`assets/`](assets/) | Imagens/PDFs referenciados pelos docs | — |

## ADRs (decisões arquiteturais)

| ID | Decisão |
|---|---|
| [ADR-001](decisions/ADR-001-stack.md) | Stack tecnológica e monorepo |
| [ADR-002](decisions/ADR-002-integration-secrets-encryption.md) | Cifragem de credenciais de integrações em banco |
| [ADR-003](decisions/ADR-003-analytics-proprio.md) | Pipeline de analytics próprio |
| [ADR-004](decisions/ADR-004-security-defense-in-depth.md) | Segurança em camadas — obrigatória para toda nova superfície |

## Runbooks (em ordem de uso típico)

| Runbook | Para quando |
|---|---|
| [`local-development.md`](runbooks/local-development.md) | Onboarding de dev |
| [`production-deploy.md`](runbooks/production-deploy.md) | Deploy normal |
| [`production-incident.md`](runbooks/production-incident.md) | Algo quebrou em prod |
| [`production-restore.md`](runbooks/production-restore.md) | Restore destrutivo a partir de snapshot |
| [`operational-handover.md`](runbooks/operational-handover.md) | Passagem de bastão operacional |
| [`analytics.md`](runbooks/analytics.md) | Manutenção do pipeline de analytics |
| [`lgpd-operations.md`](runbooks/lgpd-operations.md) | Direitos do titular, retenção, incidente LGPD |
| [`botyio-activation.md`](runbooks/botyio-activation.md) | Reativar/recadastrar credenciais Botyio |
| [`integration-secrets-master-key.md`](runbooks/integration-secrets-master-key.md) | Rotacionar master key de integrações |

## Plans (recentes primeiro)

Planos sob `plans/` são datados (`YYYY-MM-DD-titulo.md`). Os já entregues vivem em `plans/_completed/`. Os mais relevantes:

- [`2026-05-14-maximize-organic-presence.md`](plans/2026-05-14-maximize-organic-presence.md) — plano-mestre SEO + GEO (Lotes 1–4)
- [`2026-05-13-security-hardening.md`](plans/2026-05-13-security-hardening.md) — endurecimento pós-audit
- [`2026-05-12-lgpd-compliance-plan.md`](plans/2026-05-12-lgpd-compliance-plan.md) — conformidade LGPD end-to-end
- [`2026-05-12-analytics-layer-design.md`](plans/2026-05-12-analytics-layer-design.md) — design do pipeline próprio

## Playbooks

- [`astro-public-site-playbook.md`](playbooks/astro-public-site-playbook.md) — replicar este blueprint em novos projetos Astro
- [`lgpd-implementation-playbook.md`](playbooks/lgpd-implementation-playbook.md) — passo a passo de conformidade LGPD

## Como contribuir com docs

- **Decisão arquitetural?** → novo ADR sequencial em `decisions/` (nunca edita ADR aceito; cria um novo que o supersede).
- **Plano de entrega?** → `plans/YYYY-MM-DD-tema.md`. Ao concluir, mover para `plans/_completed/`.
- **Operação em produção?** → runbook em `runbooks/`, com pré-requisitos, comandos copiáveis e critério de sucesso/rollback.
- **Especificação SDD?** → use a skill `spec-driven-development`, que coloca em `specs/_active/`.
- **Referência operacional persistente?** (chave, URL, contato) → guardar em memória do harness, não em docs versionados.
