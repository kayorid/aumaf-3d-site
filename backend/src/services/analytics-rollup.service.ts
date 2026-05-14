import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'

/**
 * Roll-up idempotente: para um intervalo [from, to), recomputa
 * - analytics_daily_pageviews (por path)
 * - analytics_daily_events    (por type+name)
 * - analytics_daily_devices   (por dimension+value)
 *
 * Para cada (date) afetada faz DELETE + INSERT em transação.
 * Lê só de analytics_events (raw). Pode rodar quantas vezes quiser.
 */
export async function rollupRange(from: Date, to: Date): Promise<{ days: number }> {
  // Lista de dias distintos no intervalo (UTC)
  const startDay = startOfUtcDay(from)
  const endDay = startOfUtcDay(to)
  const days: Date[] = []
  for (let d = startDay; d <= endDay; d = new Date(d.getTime() + 86_400_000)) {
    days.push(new Date(d))
  }

  for (const day of days) {
    const dayStart = day
    const dayEnd = new Date(day.getTime() + 86_400_000)

    await prisma.$transaction(async (tx) => {
      // 1) Pageviews por path
      await tx.analyticsDailyPageview.deleteMany({ where: { date: dayStart } })
      const pvRows = await tx.$queryRaw<
        Array<{ path: string; pageviews: bigint; unique_visitors: bigint }>
      >`
        SELECT
          path,
          COUNT(*) AS pageviews,
          COUNT(DISTINCT "visitorId") AS unique_visitors
        FROM analytics_events
        WHERE "occurredAt" >= ${dayStart}
          AND "occurredAt" <  ${dayEnd}
          AND type = 'pageview'
        GROUP BY path
      `
      if (pvRows.length > 0) {
        await tx.analyticsDailyPageview.createMany({
          data: pvRows.map((r) => ({
            date: dayStart,
            path: r.path,
            pageviews: Number(r.pageviews),
            uniqueVisitors: Number(r.unique_visitors),
            avgDurationSeconds: 0, // calculado abaixo via sessions
            bounceRate: 0,
          })),
        })
      }

      // 2) Eventos por type+name (TODOS os tipos inclusive pageview)
      await tx.analyticsDailyEvent.deleteMany({ where: { date: dayStart } })
      const evRows = await tx.$queryRaw<
        Array<{ type: string; name: string | null; count: bigint; unique_visitors: bigint }>
      >`
        SELECT
          type,
          name,
          COUNT(*) AS count,
          COUNT(DISTINCT "visitorId") AS unique_visitors
        FROM analytics_events
        WHERE "occurredAt" >= ${dayStart}
          AND "occurredAt" <  ${dayEnd}
        GROUP BY type, name
      `
      if (evRows.length > 0) {
        await tx.analyticsDailyEvent.createMany({
          data: evRows.map((r) => ({
            date: dayStart,
            type: r.type,
            name: r.name,
            count: Number(r.count),
            uniqueVisitors: Number(r.unique_visitors),
          })),
        })
      }

      // 3) Devices breakdown (multi-dimensional)
      await tx.analyticsDailyDevice.deleteMany({ where: { date: dayStart } })
      const dimRows = await tx.$queryRaw<
        Array<{ dimension: string; value: string; sessions: bigint; pageviews: bigint }>
      >`
        SELECT dimension, value,
               COUNT(DISTINCT "sessionId") AS sessions,
               SUM(CASE WHEN type = 'pageview' THEN 1 ELSE 0 END) AS pageviews
          FROM (
            SELECT 'device' AS dimension, COALESCE("deviceType", 'unknown') AS value, "sessionId", type FROM analytics_events
              WHERE "occurredAt" >= ${dayStart} AND "occurredAt" < ${dayEnd}
            UNION ALL
            SELECT 'os', COALESCE("os", 'unknown'), "sessionId", type FROM analytics_events
              WHERE "occurredAt" >= ${dayStart} AND "occurredAt" < ${dayEnd}
            UNION ALL
            SELECT 'browser', COALESCE("browser", 'unknown'), "sessionId", type FROM analytics_events
              WHERE "occurredAt" >= ${dayStart} AND "occurredAt" < ${dayEnd}
            UNION ALL
            SELECT 'country', COALESCE("country", 'unknown'), "sessionId", type FROM analytics_events
              WHERE "occurredAt" >= ${dayStart} AND "occurredAt" < ${dayEnd}
            UNION ALL
            SELECT 'utm_source', COALESCE("utmSource", 'direct'), "sessionId", type FROM analytics_events
              WHERE "occurredAt" >= ${dayStart} AND "occurredAt" < ${dayEnd}
            UNION ALL
            SELECT 'referrer',
                   COALESCE(NULLIF(SUBSTRING("referrer" FROM 'https?://([^/]+)'), ''), 'direct'),
                   "sessionId", type FROM analytics_events
              WHERE "occurredAt" >= ${dayStart} AND "occurredAt" < ${dayEnd}
          ) t
          GROUP BY dimension, value
      `
      if (dimRows.length > 0) {
        await tx.analyticsDailyDevice.createMany({
          data: dimRows.map((r) => ({
            date: dayStart,
            dimension: r.dimension,
            value: r.value,
            sessions: Number(r.sessions),
            pageviews: Number(r.pageviews),
          })),
        })
      }

      // 4) Funnel "lead_conversion" (sessões do dia)
      await tx.analyticsFunnel.deleteMany({ where: { date: dayStart, name: 'lead_conversion' } })
      const funnelSteps: Array<{ step: string; order: number; predicate: string }> = [
        { step: 'visit', order: 1, predicate: "type = 'pageview'" },
        {
          step: 'cta_click',
          order: 2,
          predicate: "type = 'click' AND name LIKE 'cta_%'",
        },
        { step: 'form_start', order: 3, predicate: "type = 'form_start'" },
        { step: 'form_submit', order: 4, predicate: "type = 'form_submit'" },
        { step: 'lead_created', order: 5, predicate: "type = 'identify'" },
      ]
      for (const { step, order, predicate } of funnelSteps) {
        const visitorsRows = await tx.$queryRawUnsafe<Array<{ visitors: bigint }>>(
          `SELECT COUNT(DISTINCT "visitorId") AS visitors
             FROM analytics_events
             WHERE "occurredAt" >= $1 AND "occurredAt" < $2 AND ${predicate}`,
          dayStart,
          dayEnd,
        )
        const visitors = Number(visitorsRows[0]?.visitors ?? 0)
        await tx.analyticsFunnel.create({
          data: {
            date: dayStart,
            name: 'lead_conversion',
            step,
            stepOrder: order,
            visitors,
          },
        })
      }

      // 5) Recalcula sessions desse dia: bounced, durationSeconds, converted
      await tx.$executeRaw`
        UPDATE analytics_sessions s
        SET
          "durationSeconds" = GREATEST(
            EXTRACT(EPOCH FROM ("lastSeenAt" - "startedAt"))::int, 0
          ),
          bounced = (s.pageviews <= 1 AND s.events <= 1)
        WHERE s."startedAt" >= ${dayStart}
          AND s."startedAt" <  ${dayEnd}
      `

      // 6) Avg duration + bounce rate por path
      const dur = await tx.$queryRaw<
        Array<{ path: string; avg_dur: number; bounce_rate: number }>
      >`
        SELECT
          s."entryPath" AS path,
          AVG(s."durationSeconds")::int AS avg_dur,
          AVG(CASE WHEN s.bounced THEN 1.0 ELSE 0.0 END)::float AS bounce_rate
        FROM analytics_sessions s
        WHERE s."startedAt" >= ${dayStart}
          AND s."startedAt" <  ${dayEnd}
          AND s."entryPath" IS NOT NULL
        GROUP BY s."entryPath"
      `
      for (const d of dur) {
        await tx.analyticsDailyPageview.updateMany({
          where: { date: dayStart, path: d.path },
          data: { avgDurationSeconds: d.avg_dur ?? 0, bounceRate: d.bounce_rate ?? 0 },
        })
      }
    })

    logger.info({ date: dayStart.toISOString().slice(0, 10) }, 'Analytics roll-up done')
  }

  return { days: days.length }
}

function startOfUtcDay(d: Date): Date {
  const u = new Date(d)
  u.setUTCHours(0, 0, 0, 0)
  return u
}

/** Prune analytics_realtime — visitantes não vistos nos últimos 5 min */
export async function pruneRealtime(): Promise<{ deleted: number }> {
  const cutoff = new Date(Date.now() - 5 * 60_000)
  const r = await prisma.analyticsRealtime.deleteMany({ where: { lastSeenAt: { lt: cutoff } } })
  return { deleted: r.count }
}

/**
 * LGPD: retenção máxima de 12 meses para eventos brutos (analytics_events).
 * Tabelas agregadas (analytics_daily_*) permanecem — são anônimas por design
 * e não vinculam visitante ou IP.
 * Sessões com lastSeenAt > 12 meses também são apagadas (não-anônimas via
 * visitorId, ainda que o IP nunca tenha sido persistido).
 */
export async function pruneOldEvents(): Promise<{ events: number; sessions: number }> {
  const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60_000)
  const [events, sessions] = await Promise.all([
    prisma.analyticsEvent.deleteMany({ where: { occurredAt: { lt: cutoff } } }),
    prisma.analyticsSession.deleteMany({ where: { lastSeenAt: { lt: cutoff } } }),
  ])
  return { events: events.count, sessions: sessions.count }
}
