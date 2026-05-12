# Runbook — Analytics Próprio

**Última revisão:** 2026-05-12

Pipeline 100% AUMAF: coleta no SDK → POST `/v1/analytics/collect` → BullMQ → PostgreSQL → cron roll-up → dashboard `/analytics` no admin.

GA4 + Microsoft Clarity rodam em paralelo (Base.astro injeta as tags via `settings.routes`). Dashboard do backoffice mostra apenas os nossos dados.

---

## URLs e endpoints

| Endpoint | Auth | Função |
|---|---|---|
| `POST /api/v1/analytics/collect` | público + rate-limit 120/min | Batch JSON (até 50 eventos) |
| `POST /api/v1/analytics/collect/beacon` | público + rate-limit 120/min | Beacon (text/plain) — usado pelo `sendBeacon` |
| `GET /api/v1/analytics/overview` | JWT (ADMIN/MARKETING/EDITOR) | KPIs do período + delta vs anterior |
| `GET /api/v1/analytics/timeseries` | JWT | Série temporal (pageviews/visitors/sessions × day/hour) |
| `GET /api/v1/analytics/top-pages` | JWT | Tabela paths |
| `GET /api/v1/analytics/events` | JWT | Breakdown por type+name |
| `GET /api/v1/analytics/funnels` | JWT | Funil `lead_conversion` |
| `GET /api/v1/analytics/devices` | JWT | Breakdown por device/os/browser/country/utm_source/referrer |
| `GET /api/v1/analytics/realtime` | JWT | Visitantes ativos (últimos 5 min) |

Dashboard UI: `/analytics` no admin (sidebar item 05).

---

## Variáveis de ambiente

| Var | Default | Função |
|---|---|---|
| `ANALYTICS_ENABLED` | `true` | Desligar coleta sem deploy: setar `false` |
| `ANALYTICS_IP_SALT` | `aumaf-analytics-default-salt-change-me` | Salt para `sha256(ip+salt)` — **trocar em produção** |
| `ANALYTICS_GEOIP_DB_PATH` | — | Opcional, caminho para MaxMind GeoLite2-Country.mmdb |

No frontend (Astro):

| Var | Default | Função |
|---|---|---|
| `PUBLIC_ANALYTICS_ENDPOINT` | `/api/v1/analytics/collect` | Endpoint de coleta |

---

## Operação

### Subir tudo localmente

```bash
npm run dev   # Docker DB + backend + admin + público
# Acesse /admin → /analytics
```

### Smoke test (manda 1 evento + checa no DB)

```bash
# 1) Envia um pageview
curl -sX POST http://localhost:3000/api/v1/analytics/collect \
  -H 'content-type: application/json' \
  -d "{\"events\":[{\"eventId\":\"$(uuidgen)\",\"type\":\"pageview\",\"sessionId\":\"smoke-sess\",\"visitorId\":\"smoke-vis\",\"occurredAt\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",\"url\":\"http://localhost:4321/test\",\"path\":\"/test\"}]}"
# espera: {"status":"ok","accepted":1}

# 2) Em ~2s o worker processa. Verifica no Prisma Studio (npx prisma studio) ou:
docker exec aumaf_postgres psql -U aumaf -d aumaf_dev \
  -c "SELECT id,type,path,\"visitorId\" FROM analytics_events ORDER BY \"receivedAt\" DESC LIMIT 5;"

# 3) Força roll-up manual (opcional — cron já roda a cada hora):
docker exec aumaf_postgres psql -U aumaf -d aumaf_dev \
  -c "SELECT * FROM analytics_daily_pageviews ORDER BY date DESC LIMIT 5;"
```

### Forçar roll-up manual

```bash
# No backend (psql ou node REPL):
# Workaround: postar um job direto na queue
node -e "
const { analyticsRollupQueue } = require('./dist/workers/analytics-rollup.worker');
(async () => {
  await analyticsRollupQueue.add('manual', { kind: 'hourly' });
  console.log('Enqueued.');
  process.exit(0);
})();
"
```

### Backfill de roll-up para um intervalo

```ts
import { analyticsRollupQueue } from './workers/analytics-rollup.worker'
await analyticsRollupQueue.add('backfill', {
  kind: 'backfill',
  fromIso: '2026-05-01T00:00:00Z',
  toIso:   '2026-05-12T00:00:00Z',
})
```

### Reiniciar agregados de um dia (idempotente)

O roll-up faz DELETE+INSERT por dia, então re-rodar `hourly` cobre 24h:

```ts
await analyticsRollupQueue.add('manual', { kind: 'hourly' })
```

---

## Limpeza e retenção

**Política atual:** raw forever, agregados forever.

Quando a tabela `analytics_events` ficar muito grande (>10M linhas, ~5 GB), particionar por mês:

```sql
-- Esquema de particionamento sugerido (manual, não no Prisma):
ALTER TABLE analytics_events
  RENAME TO analytics_events_legacy;

CREATE TABLE analytics_events (LIKE analytics_events_legacy INCLUDING ALL)
  PARTITION BY RANGE ("occurredAt");

-- criar partições mensais
CREATE TABLE analytics_events_2026_05 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
-- ...
INSERT INTO analytics_events SELECT * FROM analytics_events_legacy;
```

---

## Privacidade — LGPD

- **Sem cookies de tracking.** Apenas `sessionStorage` (sessionId) e `localStorage` (visitorId).
- **IP nunca persistido em texto** — armazenado como `sha256(ip+salt)` (32 hex chars). Anonimização adicional zera último octeto antes do hash.
- **Sem fingerprint** — `visitorId` é UUID random.
- **Direito ao esquecimento:** rode os 3 `DELETE WHERE visitorId = ...` listados no ADR-003.

---

## Troubleshooting

| Sintoma | Causa provável | Fix |
|---|---|---|
| Dashboard mostra zeros | Worker `analytics-ingest` parado | `GET /health` no backend; reiniciar processo |
| Pageview chega no `/collect` mas não aparece no DB | Worker está rodando mas erro silencioso | `docker logs aumaf_backend \| grep analytics` |
| Agregados desatualizados (>30min) | Cron `analytics-rollup` parado | Verificar `scheduleAnalyticsRollups()` no boot do `server.ts` (cadência: `*/30 * * * *`) |
| Realtime sempre vazio | Cron prune deletou tudo | Verificar timestamp em `analytics_realtime.lastSeenAt` |
| Erro `country: unknown` em todos eventos | `ANALYTICS_GEOIP_DB_PATH` não configurado ou DB faltando | Baixar GeoLite2-Country.mmdb da MaxMind |
| SDK não dispara em `<a target="_blank">` | Browser navegou antes do flush | OK — `pagehide` event garante flush via beacon |

---

## Skill + Hooks

- **Skill:** `analytics-tagging` em `.claude/skills/` — guia obrigatório ao criar CTA/page/form/modal novo.
- **PostToolUse:** ao editar `.astro`/`.tsx` em `frontend-public/` ou `frontend-admin/`, roda `scripts/analytics-tagging-check.sh` — aviso non-blocking se há `<button>`/`<a>` sem `data-track`.
- **Stop:** roda `scripts/analytics-audit.sh` reportando todos os gaps do repo.
- **Pre-commit (opcional):** `scripts/install-analytics-precommit.sh` instala git hook local.

Catálogo de eventos canônicos: `packages/shared/src/schemas/analytics.ts`.

---

## Como GA4/Clarity continuam funcionando

Não tocamos no `Base.astro` em relação a GA4/Clarity. Eles continuam injetados a partir de `Setting.ga4MeasurementId` / `Setting.clarityProjectId` configurados via `/settings` no admin. O nosso pipeline coexiste — zero interferência.
