import { prisma } from '../lib/prisma'

interface Range { from: Date; to: Date }

function previousRange({ from, to }: Range): Range {
  const span = to.getTime() - from.getTime()
  return { from: new Date(from.getTime() - span), to: new Date(from.getTime()) }
}

export async function getOverview(range: Range) {
  const [curr, prev] = await Promise.all([rangeAggregates(range), rangeAggregates(previousRange(range))])
  return {
    pageviews: curr.pageviews,
    uniqueVisitors: curr.uniqueVisitors,
    sessions: curr.sessions,
    avgSessionSeconds: curr.avgSessionSeconds,
    bounceRate: curr.bounceRate,
    conversions: curr.conversions,
    conversionRate: curr.sessions > 0 ? curr.conversions / curr.sessions : 0,
    delta: {
      pageviews: pctDelta(curr.pageviews, prev.pageviews),
      uniqueVisitors: pctDelta(curr.uniqueVisitors, prev.uniqueVisitors),
      sessions: pctDelta(curr.sessions, prev.sessions),
      bounceRate: pctDelta(curr.bounceRate, prev.bounceRate),
      conversions: pctDelta(curr.conversions, prev.conversions),
    },
  }
}

function pctDelta(curr: number, prev: number): number {
  if (prev === 0) return curr === 0 ? 0 : 100
  return ((curr - prev) / prev) * 100
}

async function rangeAggregates({ from, to }: Range) {
  const rows = await prisma.$queryRaw<
    Array<{
      pageviews: bigint
      unique_visitors: bigint
      sessions: bigint
      avg_dur: number | null
      bounce_rate: number | null
      conversions: bigint
    }>
  >`
    SELECT
      COALESCE(SUM(p.pageviews), 0)::bigint AS pageviews,
      COALESCE(SUM(p."uniqueVisitors"), 0)::bigint AS unique_visitors,
      (SELECT COUNT(*) FROM analytics_sessions WHERE "startedAt" >= ${from} AND "startedAt" < ${to})::bigint AS sessions,
      (SELECT AVG("durationSeconds") FROM analytics_sessions WHERE "startedAt" >= ${from} AND "startedAt" < ${to}) AS avg_dur,
      (SELECT AVG(CASE WHEN bounced THEN 1.0 ELSE 0.0 END) FROM analytics_sessions WHERE "startedAt" >= ${from} AND "startedAt" < ${to}) AS bounce_rate,
      (SELECT COUNT(*) FROM analytics_sessions WHERE converted = true AND "startedAt" >= ${from} AND "startedAt" < ${to})::bigint AS conversions
    FROM analytics_daily_pageviews p
    WHERE p.date >= ${from} AND p.date < ${to}
  `
  const r = rows[0]
  return {
    pageviews: Number(r?.pageviews ?? 0),
    uniqueVisitors: Number(r?.unique_visitors ?? 0),
    sessions: Number(r?.sessions ?? 0),
    avgSessionSeconds: Math.round(r?.avg_dur ?? 0),
    bounceRate: Number(r?.bounce_rate ?? 0),
    conversions: Number(r?.conversions ?? 0),
  }
}

export async function getTimeseries(params: { metric: 'pageviews' | 'visitors' | 'sessions'; from: Date; to: Date; granularity: 'hour' | 'day' }) {
  const { metric, from, to, granularity } = params
  if (granularity === 'day') {
    if (metric === 'pageviews') {
      const rows = await prisma.$queryRaw<Array<{ d: Date; v: bigint }>>`
        SELECT date AS d, SUM(pageviews)::bigint AS v
        FROM analytics_daily_pageviews
        WHERE date >= ${from} AND date < ${to}
        GROUP BY date ORDER BY date ASC
      `
      return { metric, granularity, points: rows.map((r) => ({ bucket: r.d.toISOString().slice(0, 10), value: Number(r.v) })) }
    }
    if (metric === 'visitors') {
      const rows = await prisma.$queryRaw<Array<{ d: Date; v: bigint }>>`
        SELECT date AS d, MAX("uniqueVisitors")::bigint AS v
        FROM analytics_daily_pageviews
        WHERE date >= ${from} AND date < ${to}
        GROUP BY date ORDER BY date ASC
      `
      return { metric, granularity, points: rows.map((r) => ({ bucket: r.d.toISOString().slice(0, 10), value: Number(r.v) })) }
    }
    const rows = await prisma.$queryRaw<Array<{ d: Date; v: bigint }>>`
      SELECT date_trunc('day', "startedAt") AS d, COUNT(*)::bigint AS v
      FROM analytics_sessions
      WHERE "startedAt" >= ${from} AND "startedAt" < ${to}
      GROUP BY 1 ORDER BY 1 ASC
    `
    return { metric, granularity, points: rows.map((r) => ({ bucket: r.d.toISOString().slice(0, 10), value: Number(r.v) })) }
  }
  // hour granularity — usa raw events (mais caro, mas só "hoje" geralmente)
  const expr =
    metric === 'pageviews'
      ? `SUM(CASE WHEN type='pageview' THEN 1 ELSE 0 END)`
      : metric === 'visitors'
        ? `COUNT(DISTINCT "visitorId")`
        : `COUNT(DISTINCT "sessionId")`
  const rows = await prisma.$queryRawUnsafe<Array<{ d: Date; v: bigint }>>(
    `SELECT date_trunc('hour', "occurredAt") AS d, ${expr}::bigint AS v
       FROM analytics_events
       WHERE "occurredAt" >= $1 AND "occurredAt" < $2
       GROUP BY 1 ORDER BY 1 ASC`,
    from,
    to,
  )
  return { metric, granularity, points: rows.map((r) => ({ bucket: r.d.toISOString(), value: Number(r.v) })) }
}

export async function getTopPages(range: Range, limit = 20) {
  const rows = await prisma.analyticsDailyPageview.groupBy({
    by: ['path'],
    where: { date: { gte: range.from, lt: range.to } },
    _sum: { pageviews: true, uniqueVisitors: true },
    _avg: { avgDurationSeconds: true, bounceRate: true },
    orderBy: { _sum: { pageviews: 'desc' } },
    take: limit,
  })
  return rows.map((r) => ({
    path: r.path,
    pageviews: r._sum.pageviews ?? 0,
    uniqueVisitors: r._sum.uniqueVisitors ?? 0,
    avgDurationSeconds: Math.round(r._avg.avgDurationSeconds ?? 0),
    bounceRate: Number(r._avg.bounceRate ?? 0),
  }))
}

export async function getEventBreakdown(range: Range, opts: { type?: string; limit?: number } = {}) {
  const rows = await prisma.analyticsDailyEvent.groupBy({
    by: ['type', 'name'],
    where: {
      date: { gte: range.from, lt: range.to },
      ...(opts.type ? { type: opts.type } : {}),
    },
    _sum: { count: true, uniqueVisitors: true },
    orderBy: { _sum: { count: 'desc' } },
    take: opts.limit ?? 50,
  })
  return rows.map((r) => ({
    type: r.type,
    name: r.name,
    count: r._sum.count ?? 0,
    uniqueVisitors: r._sum.uniqueVisitors ?? 0,
  }))
}

export async function getFunnel(range: Range, name: string) {
  const rows = await prisma.analyticsFunnel.groupBy({
    by: ['step', 'stepOrder'],
    where: { date: { gte: range.from, lt: range.to }, name },
    _sum: { visitors: true },
    orderBy: { stepOrder: 'asc' },
  })
  const sorted = rows.sort((a, b) => a.stepOrder - b.stepOrder)
  const firstVisitors = sorted[0]?._sum.visitors ?? 0
  return {
    name,
    steps: sorted.map((r) => ({
      step: r.step,
      stepOrder: r.stepOrder,
      visitors: r._sum.visitors ?? 0,
      conversionRate: firstVisitors > 0 ? (r._sum.visitors ?? 0) / firstVisitors : 0,
    })),
  }
}

export async function getDevices(range: Range, dimension: string) {
  const rows = await prisma.analyticsDailyDevice.groupBy({
    by: ['dimension', 'value'],
    where: { date: { gte: range.from, lt: range.to }, dimension },
    _sum: { sessions: true, pageviews: true },
    orderBy: { _sum: { sessions: 'desc' } },
    take: 30,
  })
  return rows.map((r) => ({
    dimension: r.dimension,
    value: r.value,
    sessions: r._sum.sessions ?? 0,
    pageviews: r._sum.pageviews ?? 0,
  }))
}

export async function getRealtime() {
  const cutoff = new Date(Date.now() - 5 * 60_000)
  const visitors = await prisma.analyticsRealtime.findMany({
    where: { lastSeenAt: { gte: cutoff } },
    orderBy: { lastSeenAt: 'desc' },
    take: 100,
  })
  const topPaths = await prisma.analyticsRealtime.groupBy({
    by: ['path'],
    where: { lastSeenAt: { gte: cutoff } },
    _count: { _all: true },
    orderBy: { _count: { path: 'desc' } },
    take: 10,
  })
  return {
    activeVisitors: visitors.length,
    visitors: visitors.map((v) => ({
      visitorId: v.visitorId,
      path: v.path,
      country: v.country,
      deviceType: v.deviceType,
      lastSeenAt: v.lastSeenAt.toISOString(),
    })),
    topPaths: topPaths.map((p) => ({ path: p.path, count: p._count._all })),
  }
}
