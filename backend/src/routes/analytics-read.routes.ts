import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireRole } from '../middlewares/require-auth'
import * as svc from '../services/analytics-read.service'

const RangeQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

function parseRange(req: { query: unknown }) {
  const q = RangeQuery.parse(req.query)
  const now = new Date()
  const to = q.to ? new Date(q.to) : now
  const from = q.from ? new Date(q.from) : new Date(to.getTime() - 30 * 86_400_000)
  return { from, to }
}

export const analyticsReadRoutes = Router()

const guard = [requireAuth, requireRole('ADMIN', 'MARKETING', 'EDITOR')]

analyticsReadRoutes.get('/overview', ...guard, async (req, res, next) => {
  try {
    const range = parseRange(req)
    res.json({ status: 'ok', data: await svc.getOverview(range) })
  } catch (err) { next(err) }
})

analyticsReadRoutes.get('/timeseries', ...guard, async (req, res, next) => {
  try {
    const range = parseRange(req)
    const params = z
      .object({
        metric: z.enum(['pageviews', 'visitors', 'sessions']).default('pageviews'),
        granularity: z.enum(['hour', 'day']).default('day'),
      })
      .parse(req.query)
    res.json({ status: 'ok', data: await svc.getTimeseries({ ...params, ...range }) })
  } catch (err) { next(err) }
})

analyticsReadRoutes.get('/top-pages', ...guard, async (req, res, next) => {
  try {
    const range = parseRange(req)
    const { limit } = z.object({ limit: z.coerce.number().int().min(1).max(100).default(20) }).parse(req.query)
    res.json({ status: 'ok', data: await svc.getTopPages(range, limit) })
  } catch (err) { next(err) }
})

analyticsReadRoutes.get('/events', ...guard, async (req, res, next) => {
  try {
    const range = parseRange(req)
    const { type, limit } = z
      .object({
        type: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(200).default(50),
      })
      .parse(req.query)
    res.json({ status: 'ok', data: await svc.getEventBreakdown(range, { type, limit }) })
  } catch (err) { next(err) }
})

analyticsReadRoutes.get('/funnels', ...guard, async (req, res, next) => {
  try {
    const range = parseRange(req)
    const { name } = z.object({ name: z.string().default('lead_conversion') }).parse(req.query)
    res.json({ status: 'ok', data: await svc.getFunnel(range, name) })
  } catch (err) { next(err) }
})

analyticsReadRoutes.get('/devices', ...guard, async (req, res, next) => {
  try {
    const range = parseRange(req)
    const { dimension } = z
      .object({ dimension: z.enum(['device', 'os', 'browser', 'country', 'utm_source', 'referrer']).default('device') })
      .parse(req.query)
    res.json({ status: 'ok', data: await svc.getDevices(range, dimension) })
  } catch (err) { next(err) }
})

analyticsReadRoutes.get('/realtime', ...guard, async (_req, res, next) => {
  try {
    res.json({ status: 'ok', data: await svc.getRealtime() })
  } catch (err) { next(err) }
})
