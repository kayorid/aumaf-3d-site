import crypto from 'node:crypto'
import { prisma } from '../lib/prisma'
import { env } from '../config/env'
import { logger } from '../config/logger'
import type { CollectEventInput } from '@aumaf/shared'

// Lazy import — ua-parser-js é pequeno mas só usamos no worker
let UAParserCtor: typeof import('ua-parser-js').UAParser | null = null
async function getUAParser() {
  if (!UAParserCtor) {
    const mod = await import('ua-parser-js')
    UAParserCtor = mod.UAParser
  }
  return UAParserCtor
}

// GeoIP é opcional (DB MaxMind via maxmind). Se não houver path, devolve null.
let geoReader: import('maxmind').Reader<import('maxmind').CountryResponse> | null = null
let geoReaderTried = false
async function getGeoReader() {
  if (geoReaderTried) return geoReader
  geoReaderTried = true
  if (!env.ANALYTICS_GEOIP_DB_PATH) return null
  try {
    const mm = await import('maxmind')
    geoReader = await mm.open<import('maxmind').CountryResponse>(env.ANALYTICS_GEOIP_DB_PATH)
    logger.info({ path: env.ANALYTICS_GEOIP_DB_PATH }, 'Analytics GeoIP DB loaded')
  } catch (err) {
    logger.warn({ err }, 'Analytics GeoIP DB not available — country will be null')
  }
  return geoReader
}

export interface IngestContext {
  ip: string | null
  userAgent: string | null
}

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(`${ip}:${env.ANALYTICS_IP_SALT}`).digest('hex').slice(0, 32)
}

export function anonymizeIp(ip: string): string {
  // IPv4: zera último octeto. IPv6: zera últimos 80 bits.
  if (ip.includes('.')) {
    const parts = ip.split('.')
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`
  } else if (ip.includes(':')) {
    return ip.replace(/(:[0-9a-fA-F]+){5}$/, ':0:0:0:0:0')
  }
  return ip
}

interface EnrichedEvent extends CollectEventInput {
  deviceType: string | null
  os: string | null
  browser: string | null
  country: string | null
  ipHash: string | null
}

// Lista de crawlers de LLMs (ChatGPT, Claude, Perplexity, Google AI, Apple AI etc.).
// Detecção via substring no User-Agent — case-insensitive.
// Persistido em properties.isLlmBot/llmVendor para filtragem no dashboard
// (sem migration custosa — promover a coluna no futuro se virar gargalo).
const LLM_BOT_SIGNATURES: ReadonlyArray<readonly [string, string]> = [
  ['GPTBot', 'openai'],
  ['ChatGPT-User', 'openai'],
  ['OAI-SearchBot', 'openai'],
  ['ClaudeBot', 'anthropic'],
  ['Claude-Web', 'anthropic'],
  ['anthropic-ai', 'anthropic'],
  ['PerplexityBot', 'perplexity'],
  ['Perplexity-User', 'perplexity'],
  ['Google-Extended', 'google'],
  ['Googlebot-Extended', 'google'],
  ['CCBot', 'commoncrawl'],
  ['Applebot-Extended', 'apple'],
  ['cohere-ai', 'cohere'],
  ['Bytespider', 'bytedance'],
  ['DuckAssistBot', 'duckduckgo'],
  ['Meta-ExternalAgent', 'meta'],
]

export function detectLlmBot(userAgent: string | null): { isLlmBot: boolean; llmVendor: string | null } {
  if (!userAgent) return { isLlmBot: false, llmVendor: null }
  const ua = userAgent.toLowerCase()
  for (const [sig, vendor] of LLM_BOT_SIGNATURES) {
    if (ua.includes(sig.toLowerCase())) return { isLlmBot: true, llmVendor: vendor }
  }
  return { isLlmBot: false, llmVendor: null }
}

async function enrichEvent(ev: CollectEventInput, ctx: IngestContext): Promise<EnrichedEvent> {
  // 1) Parse UA — só se cliente não enviou device explícito
  let deviceType = ev.properties && typeof ev.properties.deviceType === 'string' ? (ev.properties.deviceType as string) : null
  let os: string | null = null
  let browser: string | null = null

  if (ctx.userAgent) {
    try {
      const UAParser = await getUAParser()
      const ua = new UAParser(ctx.userAgent).getResult()
      if (!deviceType) {
        deviceType = ua.device.type ?? (ua.device.type === undefined ? 'desktop' : null)
      }
      os = ua.os.name ?? null
      browser = ua.browser.name ?? null
    } catch (err) {
      logger.debug({ err }, 'UA parse failed')
    }
  }

  // 2) GeoIP (best-effort)
  let country: string | null = null
  if (ctx.ip) {
    const reader = await getGeoReader()
    if (reader) {
      try {
        const anon = anonymizeIp(ctx.ip)
        const res = reader.get(anon)
        country = res?.country?.iso_code ?? null
      } catch {
        /* ignore */
      }
    }
  }

  // 3) Hash IP (nunca persistir IP em texto)
  const ipHash = ctx.ip ? hashIp(ctx.ip) : null

  // 4) Detecção de LLM bot — marca em properties para que o dashboard
  // possa filtrar/segmentar sem schema migration. Crawlers de LLM
  // distorcem bounce rate e tempo na página (acessos curtos sem
  // interação), então isolar é importante para métricas de conversão.
  const { isLlmBot, llmVendor } = detectLlmBot(ctx.userAgent)
  const enrichedProperties = isLlmBot
    ? { ...(ev.properties ?? {}), isLlmBot: true, llmVendor }
    : ev.properties

  return {
    ...ev,
    properties: enrichedProperties,
    deviceType: isLlmBot ? 'bot' : deviceType,
    os,
    browser,
    country,
    ipHash,
  }
}

/**
 * Persiste um lote de eventos.
 * - Dedupe por eventId (UNIQUE constraint).
 * - Upsert de session e realtime.
 * Idempotente.
 */
export async function ingestBatch(events: CollectEventInput[], ctx: IngestContext): Promise<{ inserted: number; skipped: number }> {
  if (events.length === 0) return { inserted: 0, skipped: 0 }

  const enriched = await Promise.all(events.map((ev) => enrichEvent(ev, ctx)))

  let inserted = 0
  let skipped = 0

  for (const ev of enriched) {
    try {
      await prisma.$transaction(async (tx) => {
        // INSERT raw — dedupe via UNIQUE(eventId)
        await tx.analyticsEvent.create({
          data: {
            eventId: ev.eventId,
            occurredAt: new Date(ev.occurredAt),
            sessionId: ev.sessionId,
            visitorId: ev.visitorId,
            type: ev.type,
            name: ev.name ?? null,
            url: ev.url,
            path: ev.path,
            referrer: ev.referrer ?? null,
            utmSource: ev.utmSource ?? null,
            utmMedium: ev.utmMedium ?? null,
            utmCampaign: ev.utmCampaign ?? null,
            utmContent: ev.utmContent ?? null,
            utmTerm: ev.utmTerm ?? null,
            deviceType: ev.deviceType,
            os: ev.os,
            browser: ev.browser,
            country: ev.country,
            ipHash: ev.ipHash,
            properties: (ev.properties ?? undefined) as object | undefined,
          },
        })

        // Upsert session
        const isPv = ev.type === 'pageview'
        await tx.analyticsSession.upsert({
          where: { id: ev.sessionId },
          create: {
            id: ev.sessionId,
            visitorId: ev.visitorId,
            startedAt: new Date(ev.occurredAt),
            lastSeenAt: new Date(ev.occurredAt),
            pageviews: isPv ? 1 : 0,
            events: 1,
            entryPath: ev.path,
            exitPath: ev.path,
            utmSource: ev.utmSource ?? null,
            utmMedium: ev.utmMedium ?? null,
            utmCampaign: ev.utmCampaign ?? null,
            utmContent: ev.utmContent ?? null,
            utmTerm: ev.utmTerm ?? null,
            referrer: ev.referrer ?? null,
            country: ev.country,
            deviceType: ev.deviceType,
            os: ev.os,
            browser: ev.browser,
          },
          update: {
            lastSeenAt: new Date(ev.occurredAt),
            pageviews: { increment: isPv ? 1 : 0 },
            events: { increment: 1 },
            exitPath: ev.path,
            bounced: false,
          },
        })

        // Upsert realtime (TTL via cron prune)
        await tx.analyticsRealtime.upsert({
          where: { visitorId: ev.visitorId },
          create: {
            visitorId: ev.visitorId,
            sessionId: ev.sessionId,
            path: ev.path,
            country: ev.country,
            deviceType: ev.deviceType,
          },
          update: {
            sessionId: ev.sessionId,
            path: ev.path,
            country: ev.country,
            deviceType: ev.deviceType,
            lastSeenAt: new Date(),
          },
        })
      })
      inserted++
    } catch (err: unknown) {
      // Unique constraint = duplicado (dedupe). Outros erros sobem.
      const code = (err as { code?: string })?.code
      if (code === 'P2002') {
        skipped++
      } else {
        logger.error({ err, eventId: ev.eventId }, 'Analytics ingest event failed')
        throw err
      }
    }
  }

  return { inserted, skipped }
}
