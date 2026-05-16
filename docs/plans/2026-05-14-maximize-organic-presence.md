# Plano-mestre — Maximizar presença orgânica AUMAF 3D (Google + LLMs)

**Data**: 2026-05-14 · **Origem**: pergunta do Kayo — "Fizemos a máxima melhoria de performance, SEO e GEO?".
**Resposta**: não. Após audit 2026-05-13 estamos em ~70% do potencial. A camada **técnica/estrutural** está sólida (schemas, robots, llms.txt, cache, web-vitals). Falta a camada de **conteúdo + autoridade + ops** que é onde o ranking realmente se ganha.

## Diagnóstico — o que falta por dimensão

### Performance (~70% → 95%)
- ❌ Baseline real (PageSpeed Insights mobile) nunca medido
- ❌ Imagens above-the-fold sem `fetchpriority="high"` em todas as landing pages
- ❌ Fontes críticas (Pirulen, Material Symbols, Space Grotesk) sem preload
- ❌ Cloudflare em proxy DNS-only (Flexible SSL) — Brasil sofre TTFB sem edge real
- ❌ `<img>` direto em vez do `<Image>` do Astro (sem AVIF + srcset responsive)
- ❌ Bundle audit (`vite-bundle-visualizer`) nunca rodado

### SEO (~65% → 95%)
- ❌ Google Search Console + Bing Webmaster Tools não verificados
- ❌ IndexNow não implementado (ping a Bing/Yandex/Seznam ao publicar)
- ❌ `productSchema` criado mas **não aplicado** em `/materiais.astro`
- ❌ Conteúdo de blog sem frequência regular (E-E-A-T fraco)
- ❌ Autor real nos posts (hoje "Equipe AUMAF" genérico — sinal E-E-A-T baixo)
- ❌ Backlinks praticamente zero (estratégia outreach pendente)
- ❌ Breadcrumbs visíveis (schema sim, UI inconsistente)
- ❌ Internal linking matrix sub-otimizada
- ❌ Google Business Profile não auditado

### GEO (~75% → 95%)
- ❌ Markdown sources (.md cru) não expostos
- ❌ `teamMembersSchema` criado mas **não aplicado** em `/sobre.astro`
- ❌ `/industrias/*` (5 setores) ainda não existem
- ❌ `/guias/*` (4 HowTo conversacional) ainda não existem
- ❌ Tabelas comparativas (material × processo × aplicação) limitadas
- ❌ Wikipedia / Wikidata sem entrada
- ❌ Monitoring de citação em LLMs (Otterly/Profound) não contratado

## Plano em 4 lotes

### Lote 1 — Aplicar schemas criados + .md sources + 4 HowTo + IndexNow (1 PR, ~6h)
Ver `2026-05-14-lote1-quick-wins.md`. **Maior ROI técnico**: ativa schemas que foram criados mas não usados + abre canal LLM via .md cru + acelera indexação Bing/Yandex.

### Lote 2 — 5 landing pages por indústria (1 PR, ~8h)
Ver `2026-05-14-lote2-industrias.md`. Cada landing responde "impressão 3D para [setor]" — query que LLMs e Google priorizam.

### Lote 3 — Refinos de performance (1 PR, ~4h)
Ver `2026-05-14-lote3-performance-refinements.md`. Preload de fontes, fetchpriority em heros, bundle audit baseline.

### Lote 4 — Ops + estratégia de conteúdo (não-código, ação do Kayo)
Ver `2026-05-14-lote4-ops-conteudo.md`. Search Console, GBP, Cloudflare orange, calendário editorial.

## Cronograma sugerido

| Lote | Esforço | Dependência | Quem | Quando |
|---|---|---|---|---|
| 1 | 6h | nenhuma | Claude | hoje |
| 2 | 8h | Lote 1 mergeado | Claude | hoje/amanhã |
| 3 | 4h | nenhuma | Claude | hoje |
| 4 ops | 4h | Lote 1+2 deployados | Kayo + Marcos | esta semana |
| 4 conteúdo | contínuo (4h/sem) | — | Kayo + AUMAF | próximas 12 semanas |

## Métricas alvo (validar em 90 dias)

| Métrica | Hoje | Alvo 90d |
|---|---|---|
| PageSpeed Mobile (home) | ? (medir) | ≥ 90 |
| LCP p75 | ? | ≤ 2.5s |
| CLS p75 | ? | ≤ 0.1 |
| GSC impressões/mês | 0 (sem GSC) | ≥ 5.000 |
| GSC cliques/mês | 0 | ≥ 200 |
| Posts publicados | 7 total | +12 (1/semana) |
| Backlinks (Ahrefs) | ? | ≥ 10 dofollow |
| Citações em LLMs (manual) | ? | ≥ 3 vendors |
| Páginas indexadas | ? | ≥ 60 |

## Documentos canônicos relacionados

- `docs/plans/2026-05-13-audit-summary.md` — auditoria base
- `docs/plans/2026-05-13-seo-improvements.md` — plano SEO original
- `docs/plans/2026-05-13-geo-llm-optimization.md` — plano GEO original
- `docs/plans/2026-05-13-performance-optimization.md` — plano perf original
- `docs/decisions/ADR-004-security-defense-in-depth.md` — guardrails de prevenção
