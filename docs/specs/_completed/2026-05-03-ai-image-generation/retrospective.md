# Retrospective — Geração de Imagens AI (Higgsfield)

**Período**: 2026-05-03 (kickoff) → 2026-05-04 (entrega)
**Fase final**: validate ✅ → arquivamento em `_completed/`
**Linkado a**: [requirements.md](./requirements.md) · [design.md](./design.md) · [tasks.md](./tasks.md) · [status.md](./status.md)

## Resultado

39 novas imagens AI geradas + 1 embed Maps + 1 seção Equipe (4 AVIFs reaproveitados).

| Lote | Destino | Entregue | Esperado | Notas |
|------|---------|----------|----------|-------|
| A | `index.astro` + `v2/index.astro` | 2 (sls-laser + v2-highlight) | 1–7 | Decisão CLARIFY-A: reaproveitar 5 capabilities do `/` em `/v2`; só `v2-highlight-fdm-sla-sls` foi novo. |
| B | `portfolio.astro` | 12 (port-01..12) | 12 | 100% paralelizado em 1 disparo; aspect-ratio 4:3 para combinar com cards. |
| C | `materiais.astro` | 17 (mat-01..17) | 16 | Escopo expandido em +1 — havia 17 materiais no array, não 16 como inicialmente catalogado. Slot `<img>` aspect-16/9 inserido no topo do card antes da pill. |
| D | `blog-defaults.ts` + `blog/*.astro` | 8 (7 categorias + 1 fallback) | 4–6 | Decisão CLARIFY-C: usei as 7 categorias do seed como fonte canônica, mais um fallback genérico. Lib resolve por slug ou nome (slugify) com fallback explícito. |
| E | `sobre.astro` | 0 imagens AI | 0 | Decisão CLARIFY-B: Google Maps embed real (iframe sem API key, com filtro CSS para tom dark). Decisão CLARIFY-D: 4 AVIFs orfãos integrados — 3 em nova seção "Equipe AUMAF 3D" (Raissa, Thiago, Vitor), 1 (`SAE-formula.avif`) como hero do case Fórmula SAE. |

**Custo Higgsfield**: 2.455 → 2.377 créditos (consumo de **~78 créditos para 39 imagens** — em torno de 2 créditos/imagem em `nano_banana_2` 1k).

**Paridade webp/png**: 44 webps em `/public/images/` ↔ 44 PNGs em `/assets/generated/images/` (R6 satisfeito).

## O que funcionou

- **Disparo paralelo de 12+8+17 = 37 jobs concorrentes** sem fila perceptível. Tempo total Lote B ≈ 30s wall-clock para 12 imagens (vs ~3min sequencial). Servidor Higgsfield aguenta concorrência alta no plano ultra.
- **Markup-first em portfolio/materiais (R8)**: adicionar slot `<img>` antes da geração permitiu validar layout com 404s do navegador (sem crash) e evitou imagens órfãs.
- **`resolveCoverImage(coverImageUrl, category)`** centralizou o fallback do blog em uma única função, eliminando 5 sites de duplicação na branch antiga (`{cover ? <img> : <svg>}`). Apenas 2 imports e 5 chamadas para fechar todos os slots.
- **Reaproveitamento agressivo no `/v2`**: o decision A economizou 5 créditos e mantém coerência mensagem-imagem entre `/` e `/v2`.
- **Pipeline reaproveitado de PR #8**: prompt-template canônico (verde AUMAF + `NOT orange/amber/blue` 2x) entregou consistência visual de 1ª tentativa em todos os 39 prompts, sem regerações.

## O que poderia melhorar

- **Resolução padrão `1k` no `nano_banana_2`** (1376×768 / 1200×896) — visualmente OK na web, mas se quisermos PNG masters 4K para imprimir/uso comercial, será preciso passar `resolution: "2k"` explicitamente. Spec falava em 2k mas o servidor coerce para 1k quando não declarado. **Ação**: documentar no playbook que 2k deve ser explícito.
- **17 materiais (não 16)**: a contagem inicial vinha de memória; deveria ter sido validada via `wc -l` no array `materials` antes de escrever a spec. Custo: nenhum (apenas atualização de doc).
- **Iframe Google Maps com `output=embed`** funciona sem API key mas é endpoint legado da Google. Há risco médio de descontinuação no longo prazo; quando isso acontecer, migrar para Maps Embed API (free tier suficiente, mas exige key). **Ação**: deixar nota em `sobre.astro`.
- **AVIFs da equipe**: nomes de pessoa em código sem confirmação de papéis. Atribuí "Operações & Atendimento" / "Engenharia & Produção" / "Engenharia & DfAM" como inferência razoável, mas Kayo deveria validar com a AUMAF e ajustar via PR de followup se houver erro.

## Decisões registradas (CLARIFY)

| # | Decisão | Razão | Impacto observado |
|---|---------|-------|-------------------|
| A | Reaproveitar 5 imagens do `/` em `/v2` + 1 nova (`v2-highlight`) | Economia + coerência | Funcionou; v2 ficou visualmente alinhado ao `/`. |
| B | Google Maps iframe real | Mais útil ao lead, custo zero | Funcionou; filtro CSS dark integrado ao DS. |
| C | 7 categorias do seed + 1 fallback genérico = 8 capas | Cobertura total + robusto | Funcionou; lib `resolveCoverImage` faz lookup por slug ou nome. |
| D | Integrar 4 AVIFs em `sobre.astro` (Equipe + SAE case) | Humaniza, custo zero | Funcionou; nenhum AVIF orfão remanescente. |
| E | Adaptar prompt para "amostra de material" | 17 materiais visualmente distintos | Funcionou; cada material tem visual identificável. |
| F | SLS com cena distinta (powder bed + laser) | Diferenciação | Funcionou; cena coerente com o resto do DS. |

## Descobertas reutilizáveis

1. **`mcp__higgsfield__job_status sync=true`** retorna em ~25s mesmo para jobs ainda em fila — barato fazer em paralelo, evita polling loop.
2. **`nano_banana_2` aceita aspect_ratio `4:3` apesar de não estar listado canonicamente** — o servidor responde com width/height (1200×896) sem `adjustments` aviso. Útil para grids `aspect-[4/3]` (portfolio).
3. **CSS filter `invert(0.92) hue-rotate(180deg) saturate(0.4) brightness(0.95)`** transforma o iframe Maps colorido em uma versão dark coerente com o DS Cinematic — sem custo de API, sem JS, totalmente client-side.
4. **`bg-gradient-to-br from-X to-Y` + `<img object-cover>` se sobrepõem mal** — o gradient só aparece se a img não cobre. Quando a imagem entra, removi os gradients de fallback (eram visualmente concorrentes com o overlay HUD verde).

## Métricas pós-feature

| Métrica | Linha de base | Meta | Observado |
|---------|---------------|------|-----------|
| Slots HUD-placeholder ativos | 7 | 0 | **0** ✅ |
| Páginas sem nenhuma imagem | 2 (portfolio, materiais) | 0 | **0** ✅ |
| Posts blog sem fallback de capa | 100% | 0 | **0** ✅ (lib aplicada em 5 sites) |
| WebPs em `/images/` | 5 | ≥35 | **44** ✅ |
| Paridade webp↔png | 5↔5 | N↔N | **44↔44** ✅ |
| Saldo Higgsfield ao final | 2.455 | ≥100 | **2.377** ✅ |
| AVIFs orfãos | 4 | 0 | **0** ✅ (todos integrados) |

## Próximos passos não cobertos por esta spec

- Substituir AVIFs da equipe por fotos reais quando a AUMAF fornecer, mantendo mesmo basename.
- Migrar Maps embed para Maps Embed API (com key) se o endpoint legado for descontinuado.
- Considerar regerar masters em `2k` quando houver demanda de uso impresso/redes sociais (créditos disponíveis).
- Possível ADR-009 sobre o prompt-template canônico se houver evolução substantiva (atualmente apenas adaptação por contexto, não muda o template base).

## Arquivamento

- Spec move-se para `docs/specs/_completed/2026-05-03-ai-image-generation/`.
- `docs/specs/INDEX.md` e `HISTORY.md` atualizados.
- Memória `project_ai_image_generation.md` atualizada com estado pós-feature.
