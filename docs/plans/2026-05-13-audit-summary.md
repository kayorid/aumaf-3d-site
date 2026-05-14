# Auditoria Minuciosa AUMAF 3D — Sumário Executivo

**Data**: 2026-05-13
**Escopo**: Segurança · Performance · SEO · GEO · Analytics
**Branch base**: master @ 533e67b
**Ambiente auditado**: produção (https://aumaf.kayoridolfi.ai) + repositório

## Visão geral

Site está em estado **maduro** (LGPD, analytics próprio, Botyio, Google Reviews, blog SSR, design system tematizado). A auditoria revelou **3 vulnerabilidades críticas**, **lacunas de telemetria** (Web Vitals, LLM detection, backfill), e **dívida estrutural** mínima em SSR/cache. Nenhuma red flag arquitetural; tudo é tático.

## Inventário de achados por severidade

| Dimensão | Crítico | Alto | Médio | Baixo |
|---|---:|---:|---:|---:|
| Segurança | 3 | 4 | 5 | 2 |
| Performance | 0 | 1 | 4 | 2 |
| SEO | 0 | 2 | 4 | 3 |
| GEO | 0 | 1 | 4 | 2 |
| Analytics | 0 | 4 | 4 | 4 |
| **Total** | **3** | **12** | **21** | **13** |

## Top 10 ações priorizadas (fazer primeiro)

| # | Ação | Dimensão | Esforço | Plano |
|---|---|---|---|---|
| 1 | Sanitizar HTML do blog público (XSS via Marked sem DOMPurify) | Segurança | 1h | `2026-05-13-security-hardening.md` |
| 2 | Patch CVEs: `tar`, `fast-uri`, `fast-xml-builder` | Segurança | 30min | idem |
| 3 | IDOR em `/v1/media/:id` (PATCH/DELETE sem ownership check) | Segurança | 1h | idem |
| 4 | Backfill analytics 12–13/mai (rollups não rodaram pré PR #47) | Analytics | 30min | `2026-05-13-analytics-completeness.md` |
| 5 | Sincronizar catálogo de eventos analytics vs realidade | Analytics | 4h | idem |
| 6 | `prerender = true` em 15+ páginas estáticas (TTFB) | Performance | 2h | `2026-05-13-performance-optimization.md` |
| 7 | Instalar `web-vitals` + reportar LCP/CLS/INP via analytics próprio | Performance | 2h | idem |
| 8 | Alt text vazio em 3+ imagens críticas (hero, sobre, materiais) | SEO | 30min | `2026-05-13-seo-improvements.md` |
| 9 | `robots.txt` aponta para domínio errado em staging | SEO | 10min | idem |
| 10 | LLM bot detection (GPTBot/ClaudeBot/PerplexityBot) | GEO+Analytics | 3h | `2026-05-13-geo-llm-optimization.md` |

## Planos detalhados

1. [Security Hardening](./2026-05-13-security-hardening.md)
2. [Performance Optimization](./2026-05-13-performance-optimization.md)
3. [SEO Improvements](./2026-05-13-seo-improvements.md)
4. [GEO/LLM Optimization](./2026-05-13-geo-llm-optimization.md)
5. [Analytics Completeness](./2026-05-13-analytics-completeness.md)

## Estratégia de execução

- **Lote 1 (urgente, 1 PR)** — Itens 1, 2, 3, 4, 8, 9 — quick wins de segurança/SEO + backfill. ~4h.
- **Lote 2 (1 PR)** — Itens 6, 7 + cache headers + dimensões de imagem. Performance. ~6h.
- **Lote 3 (1 PR)** — Itens 5, 10 + attribution + retenção LGPD. Analytics maduro. ~10h.
- **Lote 4 (1 PR)** — GEO content: equipe nominal em /sobre, Product schema em /materiais, /glossario, /guias HowTo. ~8h.
- **Lote 5 (1 PR)** — Hardening longo prazo: 2FA, CSP, rotação de salts, audit logs. ~12h.

Cada PR deve passar: typecheck + lint + jest + smoke-test.sh. CD verde antes de prosseguir.
