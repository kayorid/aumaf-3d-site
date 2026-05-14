# Plano — Analytics Completeness AUMAF 3D

**Data**: 2026-05-13 · **Prazo**: 2 sprints (~14h)

## Contexto
Pipeline analytics próprio ativo em produção desde PR #38-#41 + #46-#47. Robust em infra (Zod validation, IP hashing SHA256, anonimização, Consent Mode v2, BullMQ rollups), mas com lacunas significativas em **cobertura de eventos**, **dados históricos** e **análise de atribuição/LLM**.

---

## 1. Sincronizar catálogo de eventos vs realidade (ALTO)

**Problema**: 8 eventos canônicos definidos em `packages/shared/src/schemas/analytics.ts` **nunca são disparados**. 2 eventos disparados não estão no catálogo.

**Eventos a implementar no frontend**:
| Evento | Local sugerido |
|---|---|
| `cta_whatsapp_fab` | `frontend-public/src/components/WhatsAppFab.astro` |
| `cta_whatsapp_header` | `frontend-public/src/components/Navbar.astro` |
| `cta_quote_material` | botões "Solicitar orçamento" em /materiais |
| `cta_quote_portfolio` | botões em /portfolio detail |
| `review_card` | `ReviewsHomeWidget.astro` (click no card) |
| `instagram_post` | `InstagramFeed.astro` (click em post) |
| `material_modal` | abertura do modal em /materiais |
| `portfolio_modal` | abertura do modal em /portfolio |

**Padrão** (via skill `analytics-tagging`):
```html
<a href="https://wa.me/55..." data-track="cta_whatsapp_fab" data-track-source="fab" data-track-page={Astro.url.pathname}>
```

**Eventos a adicionar ao catálogo**:
- `cookie_modal_reject`, `cookie_modal_save` (já disparados em `CookieConsent.astro`)
- `contato_legal_link`
- `web_vital` (será criado em [performance §2](./2026-05-13-performance-optimization.md#2-web-vitals-instrumentação))
- `lead_created_server` (server-side, ver §6)
- `post_published_server` (server-side, ver §6)

---

## 2. Backfill de analytics 12-13 maio (ALTO, urgente)

**Problema**: rollups bloqueados pelo bug `await worker.run()` até PR #47. Tabelas `analytics_daily_*` provavelmente vazias.

**Verificar primeiro**:
```bash
ssh deploy@2.24.72.8 "docker exec aumaf-backend npx prisma studio" # ou query direta
# SELECT date, COUNT(*) FROM analytics_daily_pageviews GROUP BY date ORDER BY date;
```

**Se vazias, disparar backfill**:
```ts
// scripts/analytics-backfill.ts
import { analyticsRollupQueue } from '../backend/src/queues';
const from = new Date('2026-05-12T00:00:00Z');
const to = new Date('2026-05-14T00:00:00Z');
await analyticsRollupQueue.add('rollup', {
  kind: 'backfill',
  fromIso: from.toISOString(),
  toIso: to.toISOString(),
});
```

Documentar em `docs/runbooks/analytics.md`.

---

## 3. UTM reparsing em SPA navigation

**Arquivo**: `packages/analytics-sdk/src/index.ts:157,363-376`.

**Problema**: UTMs capturados só na primeira visita. Astro SSR + client routing (View Transitions) muda URL sem disparar reparse.

**Fix**:
```ts
window.addEventListener('astro:page-load', () => {
  const params = new URLSearchParams(location.search);
  if (params.has('utm_source')) {
    state.lastUtm = parseUtm();
    persistSession();
  }
});
// + listener em popstate/pushState para SPAs puros
```

---

## 4. Server-side events

**Problema**: eventos críticos de negócio nunca emitidos do backend → funnel incompleto.

**Fix**: criar `backend/src/services/analytics-track.service.ts`:
```ts
import { prisma } from '../db';
import { randomUUID } from 'crypto';

export async function serverTrack(type: string, leadId: string | null, props: Record<string, unknown>) {
  await prisma.analyticsEvent.create({
    data: {
      eventId: randomUUID(),
      type,
      name: type,
      occurredAt: new Date(),
      receivedAt: new Date(),
      leadId,
      source: 'server',
      properties: props,
      sessionId: null,
      visitorId: null,
    },
  });
}
```

Chamar em:
- `lead.service.createLead()` → `serverTrack('lead_created_server', lead.id, { source, material })`
- `post.service.publishPost()` → `serverTrack('post_published_server', null, { postId, slug })`
- `dsr.service.completeRequest()` → `serverTrack('dsr_completed_server', null, { kind })`

Atualizar funnel `lead_conversion` para reconhecer `lead_created_server` como step final.

---

## 5. Retenção LGPD — auto-cleanup

**Problema**: nenhum `DELETE` automático em `analytics_events`. LGPD exige 12 meses.

**Fix**: novo job em `backend/src/workers/analytics-rollup.worker.ts`:
```ts
analyticsRollupQueue.add('prune-old-events', { kind: 'prune-old-events' }, {
  repeat: { pattern: '0 3 * * *', tz: 'America/Sao_Paulo' },
  jobId: 'prune-old-events-daily',
});
```

Handler em `analytics-rollup.service.ts`:
```ts
case 'prune-old-events': {
  const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const result = await prisma.analyticsEvent.deleteMany({ where: { occurredAt: { lt: cutoff } } });
  logger.info({ deleted: result.count, cutoff }, 'analytics events pruned');
  return result.count;
}
```

Documentar no ROPA (`docs/compliance/`).

---

## 6. Particionamento de analytics_events

**Problema**: crescimento >1GB/ano. Single table ficará lenta.

**Fix médio prazo** (após Lote 3, planejado para sprint 2):
```sql
-- Migration manual (não Prisma — usa pg_partman ou DIY)
ALTER TABLE analytics_events RENAME TO analytics_events_legacy;
CREATE TABLE analytics_events (LIKE analytics_events_legacy INCLUDING ALL)
  PARTITION BY RANGE (occurredAt);
CREATE TABLE analytics_events_2026_05 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
-- Worker mensal cria próxima partição e drop a de 13m+
INSERT INTO analytics_events SELECT * FROM analytics_events_legacy;
DROP TABLE analytics_events_legacy;
```

Atualizar `schema.prisma` com `@@map` se necessário.

---

## 7. Attribution — first-touch vs last-touch

**Problema**: dashboard só mostra utm_source da sessão atual; sem distinção first-touch (origem do lead) vs last-touch (origem da conversão).

**Fix**:
1. Em `analytics_sessions`, adicionar `firstUtmSource`, `firstReferrer`, `firstLandingPath` (capturados na 1ª sessão do visitorId).
2. Query attribution no service:
   ```sql
   SELECT 
     l.id,
     s_first.utmSource AS first_touch_source,
     s_last.utmSource AS last_touch_source
   FROM leads l
   JOIN analytics_sessions s_last ON s_last.leadId = l.id ORDER BY startedAt DESC LIMIT 1
   JOIN analytics_sessions s_first ON s_first.visitorId = s_last.visitorId ORDER BY startedAt ASC LIMIT 1
   ```
3. Dashboard: nova aba "Atribuição" com:
   - Funnel por canal (organic / direct / social / referral / paid)
   - Source/medium/campaign breakdown
   - Time-to-conversion (dias entre primeiro touch e lead)

---

## 8. Referrer breakdown

**Problema**: `referrer` capturado mas nunca exibido.

**Fix**: classificar referrer em buckets:
- `direct` (sem referrer)
- `search` (google.com, bing.com)
- `social` (facebook.com, instagram.com, linkedin.com)
- `llm` (chat.openai.com, perplexity.ai, claude.ai, gemini.google.com) — NOVO
- `referral` (outros)

Adicionar coluna virtual ou enrichment em `analytics-ingest.service.ts`. Dashboard: pizza chart de buckets.

---

## 9. Scroll depth distribution

**Problema**: schema captura `depth` mas dashboard não grafica.

**Fix**: nova viz "Engagement" com:
- Histograma de scroll depth por página (% de visitantes que chegou em 25/50/75/100%)
- Identificar páginas com bounce alto em 25% (problema de hook)

---

## 10. LLM bot detection (ALTO)

**Problema**: LLMs crawlers distorcem bounce rate / time-on-page; sem visibilidade de quanto AUMAF aparece em resultados de LLM (proxy).

**Fix**:
1. **Detecção** em `backend/src/services/analytics-ingest.service.ts:62-101`:
   ```ts
   const LLM_BOTS: Record<string, string> = {
     'GPTBot': 'openai',
     'ChatGPT-User': 'openai',
     'OAI-SearchBot': 'openai',
     'ClaudeBot': 'anthropic',
     'Claude-Web': 'anthropic',
     'anthropic-ai': 'anthropic',
     'PerplexityBot': 'perplexity',
     'Perplexity-User': 'perplexity',
     'Google-Extended': 'google',
     'Googlebot-Extended': 'google',
     'CCBot': 'commoncrawl',
     'Applebot-Extended': 'apple',
     'cohere-ai': 'cohere',
     'Bytespider': 'bytedance',
   };
   const ua = ctx.userAgent ?? '';
   const matched = Object.entries(LLM_BOTS).find(([sig]) => ua.includes(sig));
   const isLlmBot = !!matched;
   const llmVendor = matched?.[1] ?? null;
   ```
2. **Schema**: adicionar colunas `analytics_events.isLlmBot BOOLEAN`, `analytics_events.llmVendor TEXT` (migration Prisma).
3. **Dashboard**: 
   - Filtro global "Excluir bots LLM" (default ON para métricas de conversão)
   - Nova aba "LLM Crawlers" com:
     - Crawls por vendor (chart linha)
     - Páginas mais crawled por LLM
     - First-seen / last-seen por vendor

---

## 11. Realtime prune — reduzir frequência

**Arquivo**: `backend/src/workers/analytics-rollup.worker.ts:101-105`.

**Fix**: mudar `* * * * *` para `*/5 * * * *` (a cada 5 min). Reduz overhead Redis sem impacto perceptível em realtime widget.

---

## 12. Privacy hardening do referrer

**Problema**: `referrer` pode conter query params privados (ex: tokens em links de e-mail).

**Fix**: em `analytics-ingest.service.ts`, antes de persistir:
```ts
const refUrl = referrer ? new URL(referrer) : null;
const safeReferrer = refUrl ? `${refUrl.protocol}//${refUrl.host}${refUrl.pathname}` : null;
```

---

## Critérios de aceitação

- [ ] 100% dos eventos do catálogo são disparados em produção (validado via dashboard nas primeiras 24h)
- [ ] Tabelas `analytics_daily_*` populadas para 12 e 13/05 (backfill confirmado)
- [ ] Server-side events visíveis no dashboard (`lead_created_server`, `post_published_server`)
- [ ] Job `prune-old-events` rodando em prod e logado em audit
- [ ] LLM bots aparecem em coluna separada e filtro funciona
- [ ] Aba "Atribuição" mostra first/last touch por lead
- [ ] UTMs reparsam em SPA nav (testado manual com `?utm_source=test`)
- [ ] Smoke test verde
