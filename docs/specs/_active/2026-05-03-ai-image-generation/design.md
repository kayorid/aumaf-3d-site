# Design — Geração de Imagens AI (Higgsfield)

> Como entregar imagens fotorrealistas verde-AUMAF para todos os slots restantes do site público, mantendo coerência com PR#8.

**Linkado a**: [requirements.md](./requirements.md)
**Última atualização**: 2026-05-03

---

## 1. Visão geral da solução

A solução é dividida em **5 lotes independentes** (1 por destino), cada um com PR próprio para review incremental:

1. **Lote A — index/v2 fechamento** (sls-laser + decisão v2)
2. **Lote B — portfolio** (12 cards: adicionar slots `<img>` + 12 imagens)
3. **Lote C — materiais** (16 cards: adicionar slots `<img>` + 16 imagens)
4. **Lote D — blog defaults** (4–6 categorias de fallback + lógica de seleção determinística no Astro)
5. **Lote E — sobre.astro** (Map embed real, sem geração AI; aproveitamento ou exclusão dos AVIFs orfãos)

Cada lote segue o mesmo pipeline já validado no PR#8: gerar via Higgsfield MCP → baixar WebP min para `public/images/` → baixar PNG raw para `assets/generated/images/` → aplicar `<img>` com overlay HUD → testar via dev server. A diferença entre lotes é apenas a quantidade de imagens, o template de prompt e o markup do destino.

Lotes são **independentes** entre si — podem ser executados em qualquer ordem, em sessões diferentes. A única dependência rígida é R8: para portfolio e materiais, **adicionar os slots `<img>` no Astro vem antes** da geração (sem destino, imagem vira asset orfão).

## 2. Arquitetura

### Pipeline (mesmo para todos os lotes)

```
Higgsfield MCP (nano_banana_2)
  └─→ generate_image (prompt + 16:9 + 2k)
        └─→ job_status (sync=true, ~10-20s)
              ├─→ rawUrl (PNG 5-7 MB) ─→ assets/generated/images/<slug>.png
              └─→ minUrl (WebP 86-200 KB) ─→ frontend-public/public/images/<slug>.webp

Astro (.astro page)
  └─→ <img src="/images/<slug>.webp" loading=lazy decoding=async ...>
        + overlay HUD (bg-tech-grid + radial-gradient verde + corner brackets)
        + comentário <video poster={...}> preservado para migração futura
```

### Mudanças por camada

- **Frontend público (`frontend-public/`)**:
  - `public/images/` — recebe ≥30 novos `.webp`
  - `src/pages/index.astro` — adicionar `<img>` no slot `sls-laser`
  - `src/pages/v2/index.astro` — substituir 6+1 placeholders (decisão depende de [CLARIFY-A])
  - `src/pages/portfolio.astro` — adicionar 12 slots `<img>` ao loop existente
  - `src/pages/materiais.astro` — adicionar 16 slots `<img>` ao loop existente
  - `src/pages/blog/index.astro` + `src/pages/blog/[slug].astro` — adicionar fallback `coverImageUrl ?? defaultByCategory(post.category)`
  - `src/lib/blog-defaults.ts` (novo) — função `defaultByCategory(category: string): string` retornando path determinístico
  - `src/pages/sobre.astro` — substituir Map placeholder (decisão [CLARIFY-B]); opcional: usar AVIFs orfãos ([CLARIFY-D])
- **Repo root**:
  - `assets/generated/images/` — recebe ≥30 novos `.png` masters (mesmo basename do webp)
- **Backend / Banco / Infra**: nenhuma mudança.

## 3. Modelo de dados

Nenhuma mudança no schema Prisma. O fallback de capa de blog é puramente front-end — o Astro recebe `post.coverImageUrl` da API (que já pode vir `null`) e substitui em template-time pelo default da categoria.

## 4. Contratos de API

Nenhum novo endpoint. Higgsfield MCP é a "API externa" — invocada apenas em dev pelo agente, não em runtime.

### Tools MCP utilizadas

| Tool | Uso |
|------|-----|
| `mcp__higgsfield__balance` | Verificar créditos antes de cada lote (R10) |
| `mcp__higgsfield__generate_image` | Disparar geração (params: `model=nano_banana_2`, `aspect_ratio=16:9`, `resolution=2k`, `count=1`) |
| `mcp__higgsfield__job_status` | Polling com `sync=true` |
| `mcp__higgsfield__job_display` | Re-exibir resultado se necessário |

## 5. Mapeamento Requirements → Design

| Critério | Componente/arquivo responsável | Notas |
|----------|--------------------------------|-------|
| R1 | `src/pages/index.astro` | Lote A; gera `sls-laser.webp` + aplica no 6º slot |
| R2 | `src/pages/v2/index.astro` | Lote A; resolução depende de [CLARIFY-A] |
| R3 | `src/pages/portfolio.astro` + 12 webps | Lote B; **adicionar slots primeiro** (R8) |
| R4 | `src/pages/materiais.astro` + 16 webps | Lote C; **adicionar slots primeiro** (R8); template adaptado por material ([CLARIFY-E]) |
| R5 | `src/lib/blog-defaults.ts` + `src/pages/blog/*` | Lote D; map categoria→webp determinístico |
| R6 | Convenção de pastas + script de verificação | Item de tasks (`T-VERIFY-PARITY`) |
| R7 | Comentário no markup | Padrão já estabelecido no PR#8; replicar |
| R8 | Tasks ordenadas (slots antes de imagens) | Garantido pela ordenação em `tasks.md` |
| R9 | `width`/`height` reais + `aspect-video`/`aspect-square` no container | Padrão já estabelecido no PR#8 |
| R10 | `mcp__higgsfield__balance` antes de cada lote | Tarefa explícita no checklist |

## 6. Integrações externas

| Serviço | Propósito | Custo | Limites |
|---------|-----------|-------|---------|
| Higgsfield MCP (`nano_banana_2`) | Geração de imagens | Plano ultra do Kayo (já contratado, sem custo marginal por imagem) | ~2467 créditos disponíveis no início; 35 imagens 2k consumirão estimadamente <500 créditos |
| Google Maps embed (opcional, Lote E) | Mapa real em `sobre.astro` | Free tier suficiente | Quota Maps Embed API |

## 7. Boundaries (harness anti-drift)

### ✅ Always (obrigatórios nesta feature)

- Toda imagem WebP em `public/images/` deve ter PNG master correspondente em `assets/generated/images/` com mesmo basename (R6).
- Toda `<img>` deve ter `width`, `height`, `alt` descritivo, `loading="lazy"` (exceto LCP que usa `eager`+`fetchpriority="high"`), `decoding="async"`.
- Todo prompt deve seguir o template canônico verde AUMAF documentado em `project_ai_image_generation.md` (incluindo `NOT orange/amber/blue` 2x).
- Todo slot que era originalmente vídeo deve preservar comentário `<video poster={image}>` para migração trivial (R7).

### ⚠️ Ask first (exigem confirmação)

- Deletar AVIFs orfãos de equipe — confirmar antes (decisão [CLARIFY-D]).
- Adicionar dependência nova (ex: `@googlemaps/js-api-loader` para Lote E).
- Mudar prompt-template canônico — qualquer ajuste deve ser registrado em ADR.
- Gerar mais de 5 imagens em sequência sem checkpoint visual — risco de lote inteiro fora do tom.

### 🚫 Never (proibidos)

- Nunca gerar imagens com paleta laranja/âmbar/azul (quebra o DS).
- Nunca commitar PNG master sem o WebP correspondente, e vice-versa.
- Nunca remover o overlay HUD (corner brackets, scan-line, label) — é parte do DS Cinematic.
- Nunca usar `<img>` sem `width`/`height` (causa CLS, regride R9).
- Nunca substituir fotos reais de equipe por geração AI (fora de escopo).

## 8. Alternativas consideradas

| Opção | Prós | Contras | Veredito |
|-------|------|---------|----------|
| **A. Higgsfield + nano_banana_2** | Pipeline já validado em PR#8; qualidade comprovada; MCP nativo | Depende de saldo do plano | ✅ **Escolhida** |
| B. Stock photos (Unsplash/Pexels) | Grátis, instantâneo | Imagens genéricas, sem coerência verde-AUMAF, risco de aparecerem em sites concorrentes | Rejeitada — quebra DS |
| C. Renderização 3D real (Blender) | Controle total, paleta exata | Tempo de modelagem inviável, não temos modelos das peças | Rejeitada — custo prazo |
| D. Hire fotógrafo industrial | Realismo máximo | Custo, prazo, depende do cliente abrir a fábrica | Rejeitada — escopo do contrato |
| E. **Higgsfield Soul (treinar avatar)** | Coerência máxima ao longo de campanhas | Overkill para imagens estáticas; treino consome muitos créditos | Rejeitada — over-engineering |

## 9. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Higgsfield muda prompt response → quebra de tom entre lotes | Baixa | Alto | Gerar primeiro 1 imagem de cada lote como amostra, validar visualmente antes de gerar o resto |
| Saldo Higgsfield esgota antes de fechar todos os lotes | Muito baixa | Médio | R10 + checagem `balance` no início de cada lote |
| 16 imagens de materiais ficarem visualmente repetitivas | Média | Médio | Variar contexto (filamento em rolo, peça impressa, amostra de cor) — diversificar prompts |
| `nano_banana_2` ser depreciado ou ter quota apertada no plano | Baixa | Alto | Backup plan: `models_explore` para identificar substituto; manter PNG masters como insurance |
| Conflito de merge entre lotes paralelos | Baixa | Baixo | Lotes mexem em arquivos diferentes (exceto dois lotes em `index.astro`); sequenciar caso colidam |
| Imagens AI gerarem peças tecnicamente impossíveis (defeitos visuais óbvios) | Média | Médio | Checkpoint humano após cada amostra; descartar e regerar |

## 10. Plano de rollout

- [ ] Não há feature flag — substituições são commits diretos em `master` via PR.
- [ ] Rollout: cada lote é PR independente; merge após review visual.
- [ ] Métricas a monitorar pós-merge:
  - Lighthouse LCP em `/`, `/portfolio`, `/materiais` (não deve degradar)
  - Tamanho do bundle estático (somar todos os WebPs deve ficar <5 MB total)
- [ ] Plano de rollback: revert do PR específico do lote afetado. Imagens em `public/images/` não causam erro se ausentes — `<img>` apenas mostra alt text.

## 11. Validation gate (pós-design)

- [x] Cada critério EARS está mapeado para um componente? **Sim**, ver §5.
- [x] Algum componente listado não é necessário? **Não.** `blog-defaults.ts` é o único arquivo novo — sem ele, R5 falha.
- [x] Alguma dependência externa não validada? **Apenas Maps embed (Lote E)** — depende de [CLARIFY-B]; se for AI image, sem nova dependência.
- [x] Plano de rollback concreto? **Sim**, revert por PR; risco operacional baixíssimo.
- [x] Boundaries cobrem cenários sensíveis? **Sim**, especialmente "nunca gerar fora da paleta" e "nunca quebrar paridade webp/png".

## 12. Links

- Requirements: [requirements.md](./requirements.md)
- ADRs criados/relacionados: nenhum criado ainda; abrir ADR-009 se prompt-template mudar
- Memória técnica: `~/.claude/projects/.../memory/project_ai_image_generation.md`
- PR de referência: https://github.com/kayorid/aumaf-3d-site/pull/8
