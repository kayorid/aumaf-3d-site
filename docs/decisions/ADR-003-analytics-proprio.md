# ADR-003 — Pipeline de analytics próprio em paralelo com GA4/Clarity

**Status**: Aceito
**Data**: 2026-05-12
**Autores**: Kayo Ridolfi (kayoridolfi.ai), Claude (Opus 4.7)
**Substitui**: —
**Linkado a**: `docs/plans/2026-05-12-analytics-layer-design.md`

## Contexto

Até hoje, todo o tracking do site público AUMAF 3D rodava via terceiros (GA4, Microsoft Clarity, Facebook Pixel, GTM). Isso significa:

- **Sem soberania sobre os dados** — a AUMAF não tem cópia dos eventos, depende de Google/Microsoft/Meta para histórico.
- **Sem correlação com leads internos** — não há como ligar uma sessão GA4 ao `leads.id` no nosso DB.
- **Amostragem do GA4** — eventos podem ser perdidos em volumes altos, e a interface não é navegável programaticamente.
- **Acoplamento com providers externos** — qualquer mudança de TOS, bloqueio de cookie ou ad-blocker quebra a visibilidade.
- **Dashboard externo** — operador precisa abrir GA4/Clarity em separado, fora do backoffice.

Ao mesmo tempo, manter GA4/Clarity em paralelo é desejável: ferramentas externas seguem úteis para análise comparativa e SEO/SEM.

## Decisão

Construímos um pipeline próprio (coleta + storage + dashboard) que roda **em paralelo** com GA4/Clarity. O backoffice exibe somente nossos dados.

**Arquitetura:**

```
[browser SDK] → POST /v1/analytics/collect (sendBeacon) → BullMQ ingest
                                                              ↓
                                                         PostgreSQL raw
                                                              ↓
                                                  cron roll-up (hourly + daily)
                                                              ↓
                                                  PostgreSQL agregados
                                                              ↓
[admin React] ← GET /v1/analytics/{overview,top-pages,events,funnels,devices,realtime}
```

**Princípios:**

1. **Raw forever + agregados pré-computados.** Eventos brutos ficam indefinidamente (permite reprocessamento se a definição de uma métrica mudar). Agregados horários/diários populados por cron BullMQ idempotente — dashboard sempre <100ms.
2. **Coletor não-bloqueante.** SDK acumula até 10 eventos / 2s, envia via `navigator.sendBeacon` (sobrevive a `unload`). Backend responde **202 Accepted** sem tocar no DB — só enfileira para o worker `analytics-ingest`.
3. **Privacidade por design.** IP nunca persistido em texto — apenas `sha256(ip + DAILY_SALT)`. `visitorId` é UUID random gerado client-side (sem fingerprint). Sem cookies de tracking — só `sessionStorage` e `localStorage`.
4. **Catálogo central de eventos** em `packages/shared/src/schemas/analytics.ts` (Zod). Frontend usa `data-track="<name>"` com event delegation — sem `import` adicional em cada componente.
5. **Skill + hooks de guarda.** Skill `.claude/skills/analytics-tagging/` orienta tagueamento; hooks `PostToolUse` + `Stop` no Claude Code rodam `scripts/analytics-tagging-check.sh` e `scripts/analytics-audit.sh` para impedir drift quando novos CTAs forem criados.

**Não-decisão (parallel):** GA4, Microsoft Clarity, Facebook Pixel e GTM continuam injetados no `Base.astro` conforme `settings.routes` — o pipeline próprio é aditivo, não substitui.

## Tabelas (resumo — schema completo em `backend/prisma/schema.prisma`)

| Tabela | Função |
|---|---|
| `analytics_events` | Raw eventos individuais (eventId UUID dedupe) |
| `analytics_sessions` | Uma linha por sessionId (entry/exit, bounce, duration, converted) |
| `analytics_daily_pageviews` | Agregado: date × path |
| `analytics_daily_events` | Agregado: date × type × name |
| `analytics_daily_devices` | Agregado: date × dimension × value (device/os/browser/country/utm_source/referrer) |
| `analytics_funnels` | Agregado de funil `lead_conversion` (5 etapas) |
| `analytics_realtime` | TTL 5min — visitantes ativos para tab Realtime |

## Workers

| Queue | Trigger | Função |
|---|---|---|
| `analytics-ingest` | enfileirado por `/collect` | Parse UA, geo-IP, dedupe, INSERT raw + upsert session/realtime |
| `analytics-rollup` (`rollup`) | cron `*/30 * * * *` | Recomputa agregados das últimas 24h (idempotente) — cadência reduzida de 60→30min em 2026-05-12 |
| `analytics-rollup` (`daily`) | cron `5 0 * * *` | Fecha agregados de ontem definitivamente |
| `analytics-rollup` (`realtime-prune`) | cron `* * * * *` | DELETE `analytics_realtime WHERE lastSeenAt < now() - 5min` |

## Consequências

**Positivas:**
- AUMAF tem cópia integral dos dados de tráfego (LGPD-friendly, sem dependência externa).
- Dashboard `/analytics` no backoffice — operador não troca de contexto.
- Funil `lead_conversion` correlaciona sessão → CTA → form → submit → lead criado.
- Skill + hooks tornam o tagueamento parte do workflow padrão.

**Custos:**
- ~7 tabelas novas no Prisma (manutenção).
- Tráfego do site faz overhead trivial de `POST /collect` (batch de 10, ~1KB).
- Disco do DB cresce linearmente — para o volume da AUMAF (institucional) ~50 MB/ano é o teto realista.

**Risco aceito:**
- Sem partitioning de `analytics_events` no MVP (suficiente até ~10M rows). Quando atingir, particionar por mês (PostgreSQL nativo).
- Sem consent banner — usamos apenas localStorage (não-cookie), por isso LGPD ok. Se a AUMAF adotar consent management futuramente, o SDK precisará respeitar.

## Como rotacionar o salt de IP

```bash
# Editar env.production:
ANALYTICS_IP_SALT=<novo-valor-aleatorio-32-bytes>
# Restart backend — IPs antigos viram hashes novos (correlação histórica de IP se perde por design).
```

## Como apagar dados de um visitor (LGPD direito ao esquecimento)

```sql
DELETE FROM analytics_events    WHERE "visitorId" = $1;
DELETE FROM analytics_sessions  WHERE "visitorId" = $1;
DELETE FROM analytics_realtime  WHERE "visitorId" = $1;
```
