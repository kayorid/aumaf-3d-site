# Camada de Analytics Própria — Design

**Data:** 2026-05-12
**Autor:** kayoridolfi.ai
**Status:** Em implementação
**ADR relacionado:** docs/decisions/ADR-003-analytics-proprio.md

## Objetivo

Construir uma camada de analytics 100% própria (pipeline + storage + dashboard) sem deixar de coletar via GA4 e Microsoft Clarity (que continuam ativos, em paralelo). O dashboard do backoffice mostra **apenas** dados do nosso pipeline — nada de Google.

## Decisões de design

| Decisão | Escolha | Por quê |
|---|---|---|
| Pipeline | Próprio + GA4/Clarity em paralelo | Dono dos dados + redundância de mercado |
| Retenção | Raw forever + agregados pré-computados | Permite reprocessar histórico se métricas mudarem |
| Coleta | `navigator.sendBeacon` com buffer 10 evts / 2s | Não bloqueia render, sobrevive a `unload` |
| Ingest | `POST /v1/analytics/collect` → 202 + BullMQ | Não tocar DB no caminho quente |
| Geo-IP | MaxMind GeoLite2 (offline) | Sem chamadas externas no worker |
| UA parse | `ua-parser-js` | Padrão da indústria |
| Identidade | sessionId (sessionStorage) + visitorId (localStorage, hash UA+IP fallback) | Sem cookies de tracking, LGPD-friendly |
| Agregação | Cron horário (BullMQ repeatable) | Dashboard sempre rápido (P99 <100ms) |
| Privacidade | IP anonimizado (último octeto zerado), sem PII | LGPD Art. 12 |
| Frontend storage | sessionStorage + localStorage | Sem cookies cross-site |

## Arquitetura

```
[browser/SDK] ──POST batch──▶ [Express /collect] ──enqueue──▶ [BullMQ analytics-ingest]
                                     │                                  │
                                     └─ 202 Accepted                    ▼
                                                                   PostgreSQL
                                                                   ├─ analytics_events  (raw)
                                                                   └─ analytics_sessions
                                                                          ▲
                                                              [BullMQ cron roll-up]
                                                                          │
                                                                          ▼
                                                                   PostgreSQL
                                                                   ├─ analytics_daily_*
                                                                   └─ analytics_funnels
                                                                          ▲
[admin React] ──GET /analytics/*──▶ [Express read API] ──SELECT──┘
```

## Schema de dados

```prisma
model AnalyticsEvent {
  id          String   @id @default(cuid())
  eventId     String   @unique   // UUID gerado no client (dedupe)
  occurredAt  DateTime              // timestamp do client
  receivedAt  DateTime @default(now())
  sessionId   String
  visitorId   String
  type        String                // 'pageview' | 'click' | 'form_start' | ...
  name        String?               // p.ex. 'cta_whatsapp_fab'
  url         String
  path        String
  referrer    String?
  // UTM
  utmSource   String?
  utmMedium   String?
  utmCampaign String?
  utmContent  String?
  utmTerm     String?
  // contexto
  deviceType  String?               // mobile | desktop | tablet
  os          String?
  browser     String?
  country     String?               // ISO 3166
  region      String?
  city        String?
  ipHash      String?               // sha256(ip + salt), nunca o IP
  // payload livre
  properties  Json?
  // correlação
  leadId      String?

  @@index([occurredAt])
  @@index([sessionId])
  @@index([type, occurredAt])
  @@index([path, occurredAt])
  @@map("analytics_events")
}

model AnalyticsSession {
  id              String   @id              // = sessionId
  visitorId       String
  startedAt       DateTime
  lastSeenAt      DateTime
  pageviews       Int      @default(0)
  events          Int      @default(0)
  durationSeconds Int      @default(0)
  bounced         Boolean  @default(true)
  entryPath       String?
  exitPath        String?
  utmSource       String?
  utmMedium       String?
  utmCampaign     String?
  referrer        String?
  country         String?
  deviceType      String?
  converted       Boolean  @default(false)  // gerou lead
  leadId          String?

  @@index([startedAt])
  @@index([visitorId])
  @@map("analytics_sessions")
}

model AnalyticsDailyPageview {
  id          String   @id @default(cuid())
  date        DateTime @db.Date
  path        String
  pageviews   Int      @default(0)
  uniqueVisitors Int   @default(0)
  avgDurationSeconds Int @default(0)
  bounceRate  Float    @default(0)
  @@unique([date, path])
  @@index([date])
  @@map("analytics_daily_pageviews")
}

model AnalyticsDailyEvent {
  id        String   @id @default(cuid())
  date      DateTime @db.Date
  type      String
  name      String?
  count     Int      @default(0)
  uniqueVisitors Int @default(0)
  @@unique([date, type, name])
  @@index([date])
  @@map("analytics_daily_events")
}

model AnalyticsDailyDevice {
  id        String   @id @default(cuid())
  date      DateTime @db.Date
  dimension String   // 'device' | 'os' | 'browser' | 'country' | 'utm_source' | 'referrer'
  value     String
  sessions  Int      @default(0)
  pageviews Int      @default(0)
  @@unique([date, dimension, value])
  @@index([date, dimension])
  @@map("analytics_daily_devices")
}

model AnalyticsFunnel {
  id        String   @id @default(cuid())
  date      DateTime @db.Date
  name      String   // 'lead_conversion'
  step      String   // 'visit' | 'cta_click' | 'form_start' | 'form_submit' | 'lead_created'
  stepOrder Int
  visitors  Int      @default(0)
  @@unique([date, name, step])
  @@index([date, name])
  @@map("analytics_funnels")
}

model AnalyticsRealtime {
  id         String   @id @default(cuid())
  visitorId  String
  sessionId  String
  path       String
  country    String?
  deviceType String?
  lastSeenAt DateTime @default(now())
  @@unique([visitorId])
  @@index([lastSeenAt])
  @@map("analytics_realtime")
}
```

## Catálogo de eventos (MVP)

Definido em `packages/shared/src/schemas/analytics.ts`. Todos os componentes que disparam eventos devem usar uma constante deste enum.

| Tipo | Nome | Disparado em |
|---|---|---|
| `pageview` | — | Toda mudança de rota |
| `click` | `cta_whatsapp_fab` | Botão flutuante WhatsApp |
| `click` | `cta_whatsapp_header` | Link WhatsApp do header |
| `click` | `cta_quote_hero` | "Pedir orçamento" no hero |
| `click` | `cta_quote_material` | "Quero esse material" no modal |
| `click` | `nav_link` | Cliques no menu (properties.target) |
| `click` | `portfolio_card` | Card de projeto (properties.slug) |
| `click` | `blog_post_card` | Card de post (properties.slug) |
| `click` | `social_link` | Instagram/Facebook (properties.network) |
| `click` | `instagram_post` | Item do feed Behold |
| `click` | `review_card` | Card de avaliação Google |
| `scroll` | `depth` | 25/50/75/100% (properties.depth) |
| `engagement` | `time_on_page` | A cada 15s de foco ativo |
| `form_start` | `contact_form` | Primeiro focus em campo |
| `form_submit` | `contact_form` | Submit válido |
| `form_error` | `contact_form` | Erro de validação |
| `modal_open` | `material_modal` | Abrir modal materiais |
| `download` | — | Click em <a> que aponta para arquivo |
| `outbound` | — | Click em link externo |
| `identify` | — | Quando lead é criado (server-side) |

## SDK `@aumaf/analytics-sdk`

API pública:

```ts
import { initAnalytics, track, pageview, identify } from '@aumaf/analytics-sdk'

initAnalytics({
  endpoint: '/v1/analytics/collect',
  debug: import.meta.env.DEV,
  autoTrack: { clicks: true, scroll: true, timeOnPage: true, outbound: true },
})

pageview()                              // chamado automaticamente em mudança de rota
track('click', 'cta_whatsapp_fab')
track('form_submit', 'contact_form', { material: 'pla' })
identify({ leadId: 'cmoyg...' })        // pós lead criado
```

Auto-tracking de cliques: qualquer elemento com `data-track="event_name"` é capturado. Properties extras via `data-track-*` (kebab → camelCase em `properties`).

```html
<a data-track="cta_whatsapp_fab" data-track-location="floating" href="...">
```

Implementação isomórfica (zero side-effect em SSR): exporta `noop` no servidor, real no client.

## Endpoints HTTP

### Coleta (público, rate-limited)
- `POST /v1/analytics/collect` — body: `{ events: CollectEvent[] }`. Retorna `202`. Sem JWT.

### Dashboard (JWT, role≥EDITOR + feature `analytics:read`)
- `GET /v1/analytics/overview?from=&to=` — KPIs agregados
- `GET /v1/analytics/timeseries?metric=pageviews&from=&to=&granularity=day|hour`
- `GET /v1/analytics/top-pages?from=&to=&limit=20`
- `GET /v1/analytics/events?from=&to=&type=&limit=`
- `GET /v1/analytics/funnels?name=lead_conversion&from=&to=`
- `GET /v1/analytics/devices?from=&to=&dimension=device|os|country|utm_source`
- `GET /v1/analytics/realtime` — últimos 5 min (visitantes ativos)

Todos retornam dados **dos agregados** exceto `realtime`.

## Workers BullMQ

- **`analytics-ingest`** (queue concorrência 5): consome batch, normaliza, dedupe via `eventId @unique`, INSERT raw + upsert `analytics_sessions` + upsert `analytics_realtime`.
- **`analytics-rollup-hourly`** (repeat cron `0 * * * *`): para o último dia incompleto + hoje, refaz `analytics_daily_*` (UPSERT). Idempotente.
- **`analytics-rollup-daily`** (repeat cron `5 0 * * *`): fecha `analytics_funnels` + recalcula `bounced/converted` em sessões do dia anterior.
- **`analytics-realtime-prune`** (repeat cron `*/1 * * * *`): DELETE `analytics_realtime WHERE lastSeenAt < now() - 5min`.

## Dashboard admin

Página `/analytics` (feature gate `analytics:read`) com tabs:

1. **Overview** — KPI cards (pageviews, visitantes únicos, sessões, bounce, conversões para lead), gráfico de linha 30 dias, comparação vs período anterior.
2. **Páginas** — Tabela top pages com pageviews, únicos, tempo médio, bounce.
3. **Eventos** — Tabela agrupada por type+name com contagem e únicos.
4. **Funis** — Visualização funil `visit → cta_click → form_start → form_submit → lead_created` com conversion rate por etapa.
5. **Realtime** — Lista visitantes ativos (últimos 5 min): país, device, página atual.
6. **Fontes** — Breakdown por `utm_source`, `referrer`, direct/organic.
7. **Devices** — Pizza device type, top OS, top browsers, mapa-lista de países.

Stack: Recharts (já no admin), TanStack Query, filtro de período compartilhado via store Zustand.

## Skill `analytics-tagging`

`.claude/skills/analytics-tagging/SKILL.md` — descrição menciona triggers: "criar CTA", "novo botão", "nova página", "novo form", "novo componente público", "novo modal".

Conteúdo: checklist de tagueamento (registrar nome no catálogo `EventName` em shared → adicionar `data-track` → se for métrica nova, criar entrada em funnels/aggregations → atualizar dashboard).

## Hooks de prevenção

### `.claude/settings.json`
- **PostToolUse** em `Edit|Write`: roda `scripts/analytics-tagging-check.sh "$FILE_PATH"` que retorna mensagem se o arquivo é `.astro`/`.tsx` em `frontend-public/` ou `frontend-admin/` e contém `<button|<a` sem `data-track`.
- **Stop**: roda `scripts/analytics-audit.sh` que reporta CTAs sem tag em todo o repo.

### Lefthook `pre-commit`
- `analytics-tagging-check` em arquivos staged. Não bloqueia (warning), mas imprime contagem para a PR ver.

## Privacidade / LGPD

- IP nunca persistido em texto — só `sha256(ip + DAILY_SALT)`.
- `visitorId` gerado client-side (crypto.randomUUID), não derivado de PII.
- Banner de consent **não é necessário** porque não usamos cookies para tracking (apenas localStorage para `visitorId`). GA4 e Clarity já têm seus próprios consent flows pré-existentes.
- Endpoint `DELETE /v1/analytics/forget?visitorId=` para direito ao esquecimento.
- Documentado em `docs/runbooks/analytics.md`.

## Variáveis de ambiente

```
ANALYTICS_ENABLED=true
ANALYTICS_IP_SALT=<rotacionável diário>
ANALYTICS_GEOIP_DB_PATH=./data/GeoLite2-Country.mmdb
PUBLIC_ANALYTICS_ENDPOINT=/v1/analytics/collect
```

## Fases de entrega

1. **F1 — Schema + ingest** (#2, #3, #4): Prisma + endpoint collect + worker ingest. Testes unit.
2. **F2 — Roll-up + leitura** (#5, #6): cron + dashboard endpoints.
3. **F3 — SDK + integração público** (#7, #8): SDK + tags em todas as páginas/CTAs.
4. **F4 — Dashboard admin** (#9): UI completa com 7 tabs.
5. **F5 — Skill + hooks** (#10, #11): prevenção de drift.
6. **F6 — Testes + docs** (#12, #13): E2E, ADR, runbook.

## Como testar end-to-end (smoke)

```bash
curl -X POST http://localhost:3000/v1/analytics/collect \
  -H 'content-type: application/json' \
  -d '{"events":[{"eventId":"'$(uuidgen)'","type":"pageview","path":"/","sessionId":"s1","visitorId":"v1","occurredAt":"2026-05-12T12:00:00Z","url":"http://localhost:4321/"}]}'

# espera 202; em <2s deve aparecer 1 row em analytics_events
```
