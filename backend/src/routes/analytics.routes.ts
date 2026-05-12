import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { CollectBatchSchema } from '@aumaf/shared'
import { env } from '../config/env'
import { logger } from '../config/logger'
import { enqueueAnalyticsBatch } from '../workers/analytics-ingest.worker'

// Coletor — alto throughput, sem JWT, rate-limited.
// Limite generoso porque batch é até 50 eventos/req.
const collectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', code: 'TOO_MANY_REQUESTS' },
})

export const analyticsRoutes = Router()

function extractIp(req: Express.Request): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = req as any
  const fwd: string | undefined = r.headers?.['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0]!.trim()
  }
  return (r.ip as string | undefined) ?? (r.socket?.remoteAddress as string | undefined) ?? null
}

analyticsRoutes.post('/collect', collectLimiter, async (req, res, next) => {
  try {
    if (env.ANALYTICS_ENABLED !== 'true') {
      res.status(202).json({ status: 'ok', disabled: true })
      return
    }

    const body = CollectBatchSchema.parse(req.body)

    const ctx = {
      ip: extractIp(req as unknown as Express.Request),
      userAgent: (req.headers['user-agent'] as string | undefined) ?? null,
    }

    await enqueueAnalyticsBatch({ events: body.events, ctx })

    res.status(202).json({ status: 'ok', accepted: body.events.length })
  } catch (err) {
    next(err)
  }
})

// Beacon endpoint (POST com text/plain + JSON em body) — sendBeacon não permite custom headers
analyticsRoutes.post('/collect/beacon', collectLimiter, async (req, res, next) => {
  try {
    if (env.ANALYTICS_ENABLED !== 'true') {
      res.status(202).end()
      return
    }
    let parsed: unknown
    try {
      const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      parsed = JSON.parse(raw)
    } catch {
      res.status(400).end()
      return
    }
    const body = CollectBatchSchema.parse(parsed)
    const ctx = {
      ip: extractIp(req as unknown as Express.Request),
      userAgent: (req.headers['user-agent'] as string | undefined) ?? null,
    }
    await enqueueAnalyticsBatch({ events: body.events, ctx })
    res.status(202).end()
  } catch (err) {
    logger.warn({ err }, 'beacon collect failed')
    res.status(202).end() // beacon nunca falha visivelmente
    next(err)
  }
})
