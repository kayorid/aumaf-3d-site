# Plano — Performance Optimization AUMAF 3D

**Data**: 2026-05-13 · **Prazo**: 1 sprint (~8h)

## Objetivo
Migrar páginas estáticas para SSG, instrumentar Web Vitals, eliminar CLS, e adicionar cache headers públicos.

---

## 1. Prerender de páginas estáticas (TTFB)

**Arquivo**: `frontend-public/astro.config.ts:28` está com `output: 'server'`. Páginas sem dados dinâmicos podem ser SSG via `export const prerender = true`.

**Páginas alvo**:
- `index.astro` (carrega reviews/Instagram via fetch client-side, então pode prerender)
- `sobre.astro`, `servicos.astro`, `materiais.astro`, `portfolio.astro` (índice), `faq.astro`
- `avaliacoes.astro`, `contato.astro`
- Todas em `politica-de-privacidade`, `termos-de-uso`, `politica-de-cookies`, `lgpd/direitos`, `lgpd/verificar`
- `404.astro`

**Manter SSR**: `blog/[slug].astro`, `portfolio/[slug].astro` (dados via API; podem migrar para `getStaticPaths` build-time + ISR via revalidate).

**Ação**: Adicionar `export const prerender = true;` no topo de cada `.astro` da lista. Build local para validar saída em `dist/client/`.

**Aceitação**: TTFB cai ~200ms (medir via PageSpeed Insights antes/depois).

---

## 2. Web Vitals — instrumentação

**Problema**: zero telemetria de LCP/CLS/INP. Sem dados, otimizar é cego.

**Fix**:
```bash
cd frontend-public && npm i web-vitals
```

Em `frontend-public/src/layouts/Base.astro`, antes de `</body>`:
```html
<script>
  import('web-vitals').then(({ onCLS, onLCP, onINP, onFCP, onTTFB }) => {
    const report = (metric) => {
      if (typeof aumaf !== 'undefined' && aumaf.track) {
        aumaf.track('web_vital', null, {
          name: metric.name,
          value: Math.round(metric.value),
          rating: metric.rating,
          path: location.pathname,
        });
      }
    };
    onCLS(report); onLCP(report); onINP(report); onFCP(report); onTTFB(report);
  });
</script>
```

Adicionar evento `web_vital` ao catálogo `packages/shared/src/schemas/analytics.ts`.

Dashboard `/analytics`: nova aba "Web Vitals" com p75 de LCP/CLS/INP por página (passing/needs-improvement/poor por threshold padrão).

---

## 3. CLS — dimensões explícitas em imagens

**Arquivos**: `frontend-public/src/pages/index.astro:50,148`, `sobre.astro:36`, `materiais.astro:658`, demais heros.

**Fix**: adicionar `width` + `height` em todas `<img>` (mesmo decorativas com aspect-ratio CSS). Heros:
```astro
<img src="/images/hero-bg-hexmesh.webp"
     width="1584" height="672"
     loading="eager" decoding="async" fetchpriority="high"
     alt="" />
```

Para imagens lazy: `loading="lazy" decoding="async"`. Para above-the-fold: `loading="eager" fetchpriority="high"`.

---

## 4. Cache headers no Caddy

**Arquivo**: `deploy/Caddyfile`.

**Fix**: adicionar em vhost público:
```caddy
@public_api path /api/v1/posts/* /api/v1/settings/public /api/v1/portfolio/*
header @public_api Cache-Control "public, max-age=300, s-maxage=600, stale-while-revalidate=86400"

@images path /images/* /videos/* /fonts/*
header @images Cache-Control "public, max-age=2592000, immutable"

@robots path /robots.txt /sitemap*.xml /llms.txt
header @robots Cache-Control "public, max-age=3600"
```

Reload Caddy: `sudo systemctl reload caddy`. Validar via `curl -I https://aumaf.kayoridolfi.ai/images/hero-bg-hexmesh.webp`.

---

## 5. Database — retenção e partição de analytics_events

**Problema**: crescimento esperado >10M rows/ano sem retenção automática.

**Fix curto prazo**: Job BullMQ `analytics-prune` diário 03:00 BRT — `DELETE FROM analytics_events WHERE occurredAt < NOW() - INTERVAL '12 months'`.

**Fix médio prazo**: particionar por mês:
```sql
ALTER TABLE analytics_events RENAME TO analytics_events_legacy;
CREATE TABLE analytics_events (LIKE analytics_events_legacy INCLUDING ALL) PARTITION BY RANGE (occurredAt);
-- Criar partições mensais via worker mensal
```

Ver [analytics-completeness](./2026-05-13-analytics-completeness.md) §5.

---

## 6. Brotli no api-aumaf

**Arquivo**: `deploy/Caddyfile:76`.

**Fix**: trocar `encode gzip` por `encode zstd br gzip` (Caddy v2.11 suporta). Validar com `curl -H "Accept-Encoding: br" -I`.

---

## 7. Workers — observabilidade

- Adicionar métricas a `/health`: `queues[].counts` (waiting/active/completed/failed/delayed) — já existe parcialmente, validar.
- Alertar via Sentry se `failed > 5` em janela de 10min.

---

## Critérios de aceitação

- [ ] PageSpeed Insights mobile: Performance ≥ 90 (antes/depois documentado)
- [ ] LCP p75 ≤ 2.5s, CLS p75 ≤ 0.1, INP p75 ≤ 200ms (medido via dashboard interno após 7d)
- [ ] Cache headers visíveis em `curl -I` para /images/, /api/v1/posts/*
- [ ] Job analytics-prune rodando em produção e logando deleções
- [ ] Sem regressão em smoke test
