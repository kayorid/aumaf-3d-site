# Status — Geração de Imagens AI (Higgsfield)

**Fase atual**: clarify
**Última atualização**: 2026-05-03 21:15 GMT-3
**Próximo passo concreto**: Kayo responder as 6 perguntas em `requirements.md` §10 [CLARIFY-A..F] para destravar a fase plan→tasks de cada lote.

---

## Decisões registradas

| Data | Decisão | Razão | Referência |
|------|---------|-------|------------|
| 2026-05-03 | Adotar Higgsfield + `nano_banana_2` como pipeline canônico | Validado no PR#8 — qualidade + consistência com DS verde AUMAF | PR #8 (`f839289`) |
| 2026-05-03 | Pasta `assets/generated/images/` para masters PNG, separada de `frontend-public/public/images/` | PNG é asset reutilizável (admin/redes/briefings); WebP é asset servido pelo site | `project_ai_image_generation.md` |
| 2026-05-03 | Quebrar entrega em 5 lotes independentes (PRs separados) | Permite review visual incremental sem PRs gigantes; lotes podem rodar em sessões diferentes | `tasks.md` |
| 2026-05-03 | Slots `<img>` precisam ser adicionados **antes** da geração em portfolio/materiais (R8) | Sem destino, imagem vira asset orfão; também permite validar layout sem queimar créditos | `design.md` §7 |

## Perguntas em aberto

- [ ] [CLARIFY-A] `/v2/index.astro` — reaproveitar 5 imagens do `/` ou gerar variantes específicas? (Custo: 6 imagens vs 0)
- [ ] [CLARIFY-B] `sobre.astro` — Map placeholder vira embed real do Google Maps OU imagem aérea AI? (Recomendado: Maps real)
- [ ] [CLARIFY-C] Blog defaults — quantas categorias mapear? Listar categorias atuais no banco para basear a decisão.
- [ ] [CLARIFY-D] AVIFs orfãos da equipe (`raissa-ninelli`, `thiago-gerotto`, `vitor-goncalez`, `SAE-formula`) — integrar em `sobre.astro` (criando seção equipe nova) ou deletar?
- [ ] [CLARIFY-E] Template de prompt para 16 materiais — adaptar (foco em "amostra de material") ou manter (template industrial atual)?
- [ ] [CLARIFY-F] `sls-laser` — cena distinta (powder bed + laser real) ou variação visual de `metal-parts`?

## Blockers

- **Único blocker ativo**: as 6 perguntas de Clarify acima. Sem elas, não dá para abrir tasks de Lote A/C/D/E sem suposição arriscada. Lote B (portfolio) pode prosseguir sem clarify — é o caminho mais rápido para começar a entregar.

## Descobertas (fora de escopo planejado)

> Vazio — preencher conforme execução dos lotes encontrar slots/necessidades não previstos.

---

## Validation log (preenchido na fase Validate)

| Critério | Evidência | Status |
|----------|-----------|--------|
| R1 (index 6 slots) | _pendente_ | ❌ pendente |
| R2 (v2 7 slots) | _pendente_ | ❌ pendente |
| R3 (portfolio 12) | _pendente_ | ❌ pendente |
| R4 (materiais 16) | _pendente_ | ❌ pendente |
| R5 (blog defaults) | _pendente_ | ❌ pendente |
| R6 (paridade webp/png) | _pendente_ | ❌ pendente |
| R7 (`<video poster>` preservado) | _pendente_ | ❌ pendente |
| R8 (slots antes de imagens) | _pendente_ | ❌ pendente |
| R9 (sem layout shift no fail) | _pendente_ | ❌ pendente |
| R10 (saldo Higgsfield ≥100) | _pendente_ | ❌ pendente |

## Métricas pós-feature (preenchido na fase Retrospective)

| Métrica | Linha de base | Meta | Observado | Notas |
|---------|---------------|------|-----------|-------|
| Slots HUD-placeholder ativos | 7 | 0 | _pendente_ | grep ao final |
| Páginas sem nenhuma imagem | 2 | 0 | _pendente_ | inspeção |
| Posts blog sem fallback | 100% | 0 | _pendente_ | query |
| WebPs em `/images/` | 5 | ≥35 | _pendente_ | `ls \| wc -l` |
| Paridade webp↔png | 5↔5 | N↔N | _pendente_ | comparação de listas |

---

## Histórico de fase

| Data | Fase entrada | Quem | Notas |
|------|--------------|------|-------|
| 2026-05-03 21:10 | specify | Claude (sessão Kayo) | Spec inicializada via `init_spec.sh`; requirements.md preenchido com 10 critérios EARS + 6 [CLARIFY] |
| 2026-05-03 21:13 | plan | Claude | design.md preenchido; 5 lotes independentes; pipeline reaproveitando padrão validado em PR#8 |
| 2026-05-03 21:14 | tasks | Claude | tasks.md com ~50 tarefas distribuídas em Lote 0 + A + B + C + D + E + Validation + Closure |
| 2026-05-03 21:15 | clarify | _aguardando Kayo_ | 6 perguntas pendentes — bloqueio explícito antes de avançar para implement |
