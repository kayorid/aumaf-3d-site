# Tasks — Geração de Imagens AI (Higgsfield)

> Quebra executável em 5 lotes independentes. Cada lote é commit/PR separado. `[P]` = paralelizável dentro do lote (geração simultânea). `[CHECKPOINT]` = revisão humana obrigatória antes de prosseguir.

**Linkado a**: [design.md](./design.md)
**Última atualização**: 2026-05-03

---

## Convenções

- `[P]` — paralelizável (não toca arquivos de outras tasks pendentes)
- `[CHECKPOINT]` — para e pede revisão humana antes de avançar
- `(<arquivo>)` — arquivo principal tocado
- `→ R<n>` — qual critério EARS a task satisfaz
- Lotes são independentes — podem ser executados em qualquer ordem em sessões diferentes

---

## Lote 0 — Pré-requisitos (uma vez antes de qualquer lote)

- [ ] **T0.1** [CHECKPOINT] — Resolver as 6 perguntas de Clarify do `requirements.md` §10
  - Critério de pronto: tabela §11 `Clarifications` totalmente preenchida com decisão e razão
- [ ] **T0.2** — Verificar saldo Higgsfield (`mcp__higgsfield__balance`) → R10
  - Critério de pronto: ≥ 100 créditos disponíveis (estimativa: 35 imagens consomem <500)
- [ ] **T0.3** — Confirmar Higgsfield MCP autenticado (`balance` retorna 200, não erro auth)
  - Critério de pronto: comando retorna `{credits, plan}` sem prompt OAuth
- [ ] **T0.4** — Documentar prompt-template canônico em `docs/design/ai-image-prompt-template.md` (extrair da memória)
  - Critério de pronto: arquivo commitado, com exemplos de cada lote

---

## Lote A — Fechamento index/v2

> Cobre R1 (sls-laser) e R2 (v2 completo). Branch sugerida: `feat/ai-images-index-v2`.

- [ ] **T-A.1** — Encontrar slot `sls-laser` no `index.astro` (grep `sls-laser` ou `VIDEO_CAP_05` se existir)
  - Critério de pronto: linha exata localizada
- [ ] **T-A.2** — Gerar imagem `sls-laser.webp` via Higgsfield (prompt: cena SLS laser + powder bed verde)
  - Critério de pronto: job completed, URLs disponíveis
- [ ] **T-A.3** — Baixar `sls-laser.webp` para `public/images/` + `sls-laser.png` para `assets/generated/images/` → R6
  - Critério de pronto: ambos arquivos existem, tamanhos esperados (~150 KB / ~7 MB)
- [ ] **T-A.4** [CHECKPOINT] — Validação visual de `sls-laser` (tom verde, qualidade, fidelidade técnica)
  - Critério de pronto: Kayo aprova ou pede regeneração
- [ ] **T-A.5** — Aplicar `<img>` no slot `sls-laser` do `index.astro` com mesmo padrão dos 5 anteriores → R1, R7, R9
  - Critério de pronto: dev server exibe imagem, sem layout shift
- [ ] **T-A.6** — Conforme decisão [CLARIFY-A]: reaproveitar 5+1 imagens em `v2/index.astro` OU gerar 6+1 variantes
  - Critério de pronto: `v2/index.astro` sem nenhum slot HUD-placeholder; comentários `<video poster>` preservados
- [ ] **T-A.7** [P] — Gerar `v2-highlight.webp` (slot extra do v2) → R2
  - Critério de pronto: imagem aplicada, dev server OK
- [ ] **T-A.8** — Reiniciar dev server e verificar `curl -sI` em todos os webps novos retorna 200
  - Critério de pronto: todos os webps respondem 200; homepage e /v2 carregam sem console errors
- [ ] **T-A.9** [CHECKPOINT] — Code review do PR Lote A
- [ ] **T-A.10** — Merge + cleanup branch local

## Lote B — Portfolio (12 cases)

> Cobre R3 + R8. Branch sugerida: `feat/ai-images-portfolio`.

- [ ] **T-B.1** — Inspecionar `portfolio.astro` para entender estrutura atual (grid, loop, dataset)
  - Critério de pronto: dataset dos 12 cases identificado (estático no .astro ou via API?)
- [ ] **T-B.2** — Definir naming: `port-01-<slug>.webp` ... `port-12-<slug>.webp`
  - Critério de pronto: lista de 12 nomes commitada em comentário do PR
- [ ] **T-B.3** — **Adicionar slot `<img>` ao card do loop em `portfolio.astro`** (com fallback graceful se imagem ausente) → R8
  - Critério de pronto: estrutura de card já preparada para receber imagem; dev server funciona com placeholders
- [ ] **T-B.4** [CHECKPOINT] — Validar layout dos cards com slot novo (sem imagem ainda)
  - Critério de pronto: Kayo aprova proporção (4:3 ou 16:9), posicionamento dos overlays
- [ ] **T-B.5** [P] — Gerar 4 imagens (PORT-01 a PORT-04) — primeiro batch para validar tom
  - Critério de pronto: 4 jobs completed, downloaded
- [ ] **T-B.6** [CHECKPOINT] — Validação visual do batch 1 (4/12)
  - Critério de pronto: tom consistente com PR#8; se não, ajustar prompt-template antes de prosseguir
- [ ] **T-B.7** [P] — Gerar PORT-05 a PORT-08 (batch 2)
  - Critério de pronto: 4 jobs completed, downloaded
- [ ] **T-B.8** [P] — Gerar PORT-09 a PORT-12 (batch 3)
  - Critério de pronto: 4 jobs completed, downloaded
- [ ] **T-B.9** — Aplicar 12 imagens no `portfolio.astro` (mapear slug → arquivo)
  - Critério de pronto: dev server exibe os 12 cards com imagens distintas
- [ ] **T-B.10** — Verificar paridade webp/png (script ou comparação manual) → R6
  - Critério de pronto: `ls public/images/port-*.webp | wc -l == ls assets/generated/images/port-*.png | wc -l`
- [ ] **T-B.11** [CHECKPOINT] — Code review do PR Lote B
- [ ] **T-B.12** — Merge + cleanup branch local

## Lote C — Materiais (16)

> Cobre R4 + R8. Branch sugerida: `feat/ai-images-materiais`.

- [ ] **T-C.1** — Inspecionar `materiais.astro` e listar os 16 materiais com slugs
  - Critério de pronto: lista PLA/ABS/PETG/PA/PA-CF/PEEK/TPU/Resinas/316L/etc. consolidada
- [ ] **T-C.2** — Adaptar prompt-template para "amostra de material" conforme [CLARIFY-E]
  - Critério de pronto: variant do template documentada em `docs/design/ai-image-prompt-template.md`
- [ ] **T-C.3** — Adicionar slot `<img>` ao card do loop em `materiais.astro` → R8
  - Critério de pronto: dev server funciona com placeholders
- [ ] **T-C.4** [CHECKPOINT] — Validar layout dos cards de material com slot novo
- [ ] **T-C.5** [P] — Gerar batch 1: 4 materiais "filamento típico" (PLA/ABS/PETG/PA)
- [ ] **T-C.6** [CHECKPOINT] — Validação visual do batch 1 (4/16) — tom + diferenciação visível entre materiais
- [ ] **T-C.7** [P] — Gerar batch 2: 4 materiais "técnicos" (PA-CF/PEEK/TPU/Nylon)
- [ ] **T-C.8** [P] — Gerar batch 3: 4 resinas SLA (Standard/Tough/Flexible/Castable)
- [ ] **T-C.9** [P] — Gerar batch 4: 4 metais SLM (316L/Ti/Al/Inox)
- [ ] **T-C.10** — Aplicar 16 imagens no `materiais.astro`
  - Critério de pronto: dev server exibe 16 cards distinguíveis
- [ ] **T-C.11** — Verificar paridade webp/png → R6
- [ ] **T-C.12** [CHECKPOINT] — Code review do PR Lote C
- [ ] **T-C.13** — Merge + cleanup branch local

## Lote D — Blog defaults

> Cobre R5. Branch sugerida: `feat/ai-images-blog-defaults`.

- [ ] **T-D.1** — Listar categorias existentes no banco (`SELECT DISTINCT category FROM Post`)
  - Critério de pronto: lista finita; conferir com [CLARIFY-C] (4 vs 6)
- [ ] **T-D.2** [P] — Gerar N imagens (uma por categoria) com prompt categórico
  - Critério de pronto: N webps + pngs baixados (`blog-default-<categoria>.webp`)
- [ ] **T-D.3** [CHECKPOINT] — Validação visual das N capas (tom + relação clara com categoria)
- [ ] **T-D.4** — Criar `frontend-public/src/lib/blog-defaults.ts` exportando `defaultByCategory(category: string): string`
  - Critério de pronto: função determinística com switch/map para todas as N categorias + fallback genérico
- [ ] **T-D.5** — Aplicar fallback em `src/pages/blog/index.astro` (cards) e `src/pages/blog/[slug].astro` (hero)
  - Critério de pronto: post sem `coverImageUrl` exibe a capa categórica
- [ ] **T-D.6** — Adicionar teste de lint/grep para garantir todos os usos de `coverImageUrl` passam pelo fallback
  - Critério de pronto: nenhum `<img src={post.coverImageUrl}` direto; todos via `defaultByCategory`
- [ ] **T-D.7** [CHECKPOINT] — Code review do PR Lote D
- [ ] **T-D.8** — Merge + cleanup branch local

## Lote E — Sobre.astro (sem AI)

> Cobre o resíduo do Map placeholder + decisão sobre AVIFs orfãos. Branch sugerida: `feat/sobre-map-and-team`.

- [ ] **T-E.1** [CHECKPOINT] — Resolver [CLARIFY-B] (Maps embed real vs imagem aérea AI)
- [ ] **T-E.2** — Implementar decisão B (embed `<iframe>` Maps OU gerar+aplicar imagem aérea AI de São Carlos)
  - Critério de pronto: Map placeholder substituído; dev server exibe mapa real ou imagem
- [ ] **T-E.3** [CHECKPOINT] — Resolver [CLARIFY-D] (integrar AVIFs de equipe ou deletar)
- [ ] **T-E.4** — Implementar decisão D (adicionar seção equipe usando AVIFs OU `git rm` os 4 arquivos)
  - Critério de pronto: nenhum AVIF orfão; equipe visível ou pasta limpa
- [ ] **T-E.5** [CHECKPOINT] — Code review do PR Lote E
- [ ] **T-E.6** — Merge + cleanup branch local

---

## Validação final (após todos os lotes)

- [ ] **T-V.1** — `grep -r "Vídeo em produção\|VIDEO_HERO\|VIDEO_CAP_" frontend-public/src/pages/` deve retornar **apenas** comentários `<video poster>` (R1, R2)
- [ ] **T-V.2** — `ls frontend-public/public/images/*.webp | wc -l` deve ser ≥ 35
- [ ] **T-V.3** — Comparar lista webp ↔ png — todos pareados (R6)
- [ ] **T-V.4** — Lighthouse em `/`, `/portfolio`, `/materiais`, `/blog` — LCP < 2.5s, CLS < 0.1 (R9)
- [ ] **T-V.5** — Preencher tabela de Validation no `status.md` com evidência por critério EARS
- [ ] **T-V.6** [CHECKPOINT] — Demo final ao Kayo

## Documentação e fechamento

- [ ] **T-F.1** — Atualizar `frontend-public/CLAUDE.md` com seção "Imagens" (convenção webp/png + fallback blog)
- [ ] **T-F.2** — Criar ADR-009 (`docs/adrs/`) se prompt-template foi ajustado durante os lotes
- [ ] **T-F.3** — Atualizar memória `project_ai_image_generation.md` com estado pós-feature (X/N entregues)
- [ ] **T-F.4** — Mover spec para `_completed/` + escrever `retrospective.md`
- [ ] **T-F.5** — Atualizar `docs/specs/INDEX.md` e `HISTORY.md`

---

## Notas de execução

- **Lotes em sessões separadas**: contexto fica menor, validação visual fica mais nítida. Não consolidar 35 imagens em uma sessão.
- **Sempre balance antes do lote** (T0.2 reaproveitada): se saldo cair abaixo de 100, parar (R10).
- **Padrão de download paralelo** já validado no PR#8:
  ```bash
  curl -sSL -o A.webp <url1> & curl -sSL -o B.webp <url2> & wait
  ```
- **Higgsfield MCP desconecta** entre turnos — basta `ToolSearch select:mcp__higgsfield__generate_image,...` para recarregar schemas.
- **Em qualquer descoberta fora de escopo** (ex: novo slot que não estava no plano), registrar em `status.md` § Descobertas, não enxertar.
