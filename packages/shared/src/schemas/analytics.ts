import { z } from 'zod'

// ============================================================
// Catálogo de tipos e nomes de eventos.
// Adicione aqui qualquer novo evento que o frontend deva disparar.
// ============================================================

export const ANALYTICS_EVENT_TYPES = [
  'pageview',
  'click',
  'scroll',
  'engagement',
  'form_start',
  'form_submit',
  'form_error',
  'modal_open',
  'modal_close',
  'download',
  'outbound',
  'identify',
  'custom',
] as const

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number]

export const ANALYTICS_EVENT_NAMES = [
  // CTAs
  'cta_whatsapp_fab',
  'cta_whatsapp_header',
  'cta_whatsapp_footer',
  'cta_quote_hero',
  'cta_quote_material',
  'cta_quote_portfolio',
  // Navegação
  'nav_link',
  'footer_link',
  // Conteúdo
  'portfolio_card',
  'blog_post_card',
  'review_card',
  'instagram_post',
  'social_link',
  // Engajamento
  'depth',
  'time_on_page',
  // Formulário
  'contact_form',
  // Modais
  'material_modal',
  'portfolio_modal',
] as const
export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number]

// ============================================================
// Payload de coleta (POST /v1/analytics/collect)
// ============================================================

export const CollectEventSchema = z.object({
  eventId: z.string().uuid(),
  occurredAt: z.string().datetime(),
  sessionId: z.string().min(8).max(128),
  visitorId: z.string().min(8).max(128),
  type: z.enum(ANALYTICS_EVENT_TYPES),
  name: z.string().max(80).nullable().optional(),
  url: z.string().url().max(2048),
  path: z.string().max(512),
  referrer: z.string().max(2048).nullable().optional(),
  // UTMs
  utmSource: z.string().max(200).nullable().optional(),
  utmMedium: z.string().max(200).nullable().optional(),
  utmCampaign: z.string().max(200).nullable().optional(),
  utmContent: z.string().max(200).nullable().optional(),
  utmTerm: z.string().max(200).nullable().optional(),
  // contexto do cliente
  screenWidth: z.number().int().min(0).max(20000).nullable().optional(),
  screenHeight: z.number().int().min(0).max(20000).nullable().optional(),
  language: z.string().max(20).nullable().optional(),
  timezone: z.string().max(80).nullable().optional(),
  // payload livre
  properties: z.record(z.unknown()).nullable().optional(),
})
export type CollectEventInput = z.infer<typeof CollectEventSchema>

export const CollectBatchSchema = z.object({
  events: z.array(CollectEventSchema).min(1).max(50),
})
export type CollectBatchInput = z.infer<typeof CollectBatchSchema>

// ============================================================
// Leitura — dashboard
// ============================================================

export const AnalyticsDateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  granularity: z.enum(['hour', 'day']).default('day').optional(),
})
export type AnalyticsDateRange = z.infer<typeof AnalyticsDateRangeSchema>

export const OverviewKpisSchema = z.object({
  pageviews: z.number(),
  uniqueVisitors: z.number(),
  sessions: z.number(),
  avgSessionSeconds: z.number(),
  bounceRate: z.number(),
  conversions: z.number(),
  conversionRate: z.number(),
  // diferença % vs período anterior
  delta: z.object({
    pageviews: z.number(),
    uniqueVisitors: z.number(),
    sessions: z.number(),
    bounceRate: z.number(),
    conversions: z.number(),
  }),
})
export type OverviewKpis = z.infer<typeof OverviewKpisSchema>

export const TimeseriesPointSchema = z.object({
  bucket: z.string(),
  value: z.number(),
})
export const TimeseriesSchema = z.object({
  metric: z.string(),
  granularity: z.enum(['hour', 'day']),
  points: z.array(TimeseriesPointSchema),
})
export type Timeseries = z.infer<typeof TimeseriesSchema>

export const TopPageSchema = z.object({
  path: z.string(),
  pageviews: z.number(),
  uniqueVisitors: z.number(),
  avgDurationSeconds: z.number(),
  bounceRate: z.number(),
})
export type TopPage = z.infer<typeof TopPageSchema>

export const EventBreakdownSchema = z.object({
  type: z.string(),
  name: z.string().nullable(),
  count: z.number(),
  uniqueVisitors: z.number(),
})
export type EventBreakdown = z.infer<typeof EventBreakdownSchema>

export const FunnelStepSchema = z.object({
  step: z.string(),
  stepOrder: z.number(),
  visitors: z.number(),
  conversionRate: z.number(),
})
export const FunnelSchema = z.object({
  name: z.string(),
  steps: z.array(FunnelStepSchema),
})
export type Funnel = z.infer<typeof FunnelSchema>

export const DeviceBreakdownSchema = z.object({
  dimension: z.string(),
  value: z.string(),
  sessions: z.number(),
  pageviews: z.number(),
})
export type DeviceBreakdown = z.infer<typeof DeviceBreakdownSchema>

export const RealtimeVisitorSchema = z.object({
  visitorId: z.string(),
  path: z.string(),
  country: z.string().nullable(),
  deviceType: z.string().nullable(),
  lastSeenAt: z.string(),
})
export const RealtimeSnapshotSchema = z.object({
  activeVisitors: z.number(),
  visitors: z.array(RealtimeVisitorSchema),
  topPaths: z.array(z.object({ path: z.string(), count: z.number() })),
})
export type RealtimeSnapshot = z.infer<typeof RealtimeSnapshotSchema>
