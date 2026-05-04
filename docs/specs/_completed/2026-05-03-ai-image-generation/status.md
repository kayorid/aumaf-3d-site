# Status — Geração de Imagens AI (Higgsfield)

**Fase atual**: validate (concluída)
**Última atualização**: 2026-05-04 GMT-3
**Próximo passo concreto**: Retrospective + arquivamento em `_completed/`.

---

## Decisões registradas

| Data | Decisão | Razão | Referência |
|------|---------|-------|------------|
| 2026-05-03 | Adotar Higgsfield + `nano_banana_2` como pipeline canônico | Validado no PR#8 — qualidade + consistência com DS verde AUMAF | PR #8 (`f839289`) |
| 2026-05-03 | Pasta `assets/generated/images/` para masters PNG, separada de `frontend-public/public/images/` | PNG é asset reutilizável (admin/redes/briefings); WebP é asset servido pelo site | `project_ai_image_generation.md` |
| 2026-05-03 | Quebrar entrega em 5 lotes independentes (PRs separados) | Permite review visual incremental sem PRs gigantes; lotes podem rodar em sessões diferentes | `tasks.md` |
| 2026-05-03 | Slots `<img>` precisam ser adicionados **antes** da geração em portfolio/materiais (R8) | Sem destino, imagem vira asset orfão; também permite validar layout sem queimar créditos | `design.md` §7 |

## Perguntas em aberto

> Todas as 6 resolvidas em 2026-05-04 — ver `requirements.md` §11.

## Blockers

- **Nenhum**. Saldo Higgsfield OK (2.455 créditos), 6 clarifications respondidas, 7 categorias do blog mapeadas no seed.

## Descobertas (fora de escopo planejado)

> Vazio — preencher conforme execução dos lotes encontrar slots/necessidades não previstos.

---

## Validation log (preenchido na fase Validate)

| Critério | Evidência | Status |
|----------|-----------|--------|
| R1 (index slot sls-laser) | `index.astro` linha ~558 com `<img src="/images/sls-laser.webp">`; build `/index.html` OK | ✅ |
| R2 (v2 fechamento) | `v2/index.astro` 4 capabilities reaproveitam `/images/cap-*.webp` + `sls-laser` no slot SLS + `v2-highlight-fdm-sla-sls.webp` no featured blog; build `/v2/index.html` OK | ✅ |
| R3 (portfolio 12) | 12 webps `port-01..12-*` aplicados no loop de `portfolio.astro`; build `/portfolio/index.html` OK | ✅ |
| R4 (materiais 17, escopo expandido de 16→17) | 17 webps `mat-01..17-*` aplicados em `materiais.astro` com prompt-template adaptado por material (filamento/peça/amostra) | ✅ |
| R5 (blog defaults) | `src/lib/blog-defaults.ts` criado com `resolveCoverImage()`; 7 categorias do seed mapeadas + 1 fallback genérico; aplicado em `blog/index.astro` (featured + grid) e `blog/[slug].astro` (hero, ogImage, related) | ✅ |
| R6 (paridade webp/png) | 44 webps em `frontend-public/public/images/` ↔ 44 PNGs em `assets/generated/images/` | ✅ 44↔44 |
| R7 (`<video poster>` preservado) | Comentários `<video poster={image}>` mantidos em todos os slots originalmente de vídeo (index `VIDEO_SLS`, capabilities x4, v2 idem) | ✅ |
| R8 (slots antes de imagens) | Slots `<img>` adicionados no markup ANTES da geração para portfolio (12) e materiais (17) — pipeline grafou ordem em tasks.md | ✅ |
| R9 (sem layout shift no fail) | Todos os `<img>` têm `width`/`height` reais e containers `aspect-[…]`; build sem warnings de CLS | ✅ |
| R10 (saldo Higgsfield ≥100) | Saldo inicial 2.455 → final 2.377 (consumo de ~78 créditos para 39 imagens novas: 2 lote A + 12 B + 17 C + 8 D = 39) | ✅ |

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
| 2026-05-04 | implement | Claude (autorização autônoma do Kayo) | Kayo autorizou avançar com melhores decisões; 6 clarifications resolvidas (ver requirements §11); saldo OK |
| 2026-05-04 | validate | Claude | 39 imagens AI geradas (2A + 12B + 17C + 8D) + Maps embed + seção Equipe (E); build limpo; paridade 44↔44; 10/10 critérios EARS satisfeitos |
