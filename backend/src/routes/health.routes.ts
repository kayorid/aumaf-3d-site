import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { pingRedis } from '../lib/redis'
import { listRegisteredWorkers, getQueueStats } from '../workers'
import { logger } from '../config/logger'

interface ServiceStatus {
  status: 'up' | 'down'
  latencyMs?: number
  error?: string
}

interface QueueStatus {
  status: 'active' | 'unknown'
  waiting?: number
  active?: number
  completed?: number
  failed?: number
  delayed?: number
}

interface HealthReport {
  status: 'ok' | 'degraded'
  timestamp: string
  uptimeSec: number
  services: {
    db: ServiceStatus
    redis: ServiceStatus
    queues: Record<string, QueueStatus>
  }
}

async function pingDatabase(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'up', latencyMs: Date.now() - start }
  } catch (err) {
    return {
      status: 'down',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

async function collectQueueStatuses(): Promise<Record<string, QueueStatus>> {
  const out: Record<string, QueueStatus> = {}
  for (const { name } of listRegisteredWorkers()) {
    try {
      const stats = await getQueueStats(name)
      if (!stats) {
        out[name] = { status: 'unknown' }
        continue
      }
      out[name] = {
        status: 'active',
        waiting: stats.waiting,
        active: stats.active,
        completed: stats.completed,
        failed: stats.failed,
        delayed: stats.delayed,
      }
    } catch (err) {
      logger.error({ err, queue: name }, 'Failed to collect queue stats')
      out[name] = { status: 'unknown' }
    }
  }
  return out
}

export const healthRoutes = Router()

healthRoutes.get('/', async (_req: Request, res: Response) => {
  const [db, redisPing, queues] = await Promise.all([
    pingDatabase(),
    pingRedis(),
    collectQueueStatuses(),
  ])

  const redis: ServiceStatus = redisPing.ok
    ? { status: 'up', latencyMs: redisPing.latencyMs }
    : { status: 'down', latencyMs: redisPing.latencyMs, error: redisPing.error }

  const ok = db.status === 'up' && redis.status === 'up'
  const report: HealthReport = {
    status: ok ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSec: Math.floor(process.uptime()),
    services: { db, redis, queues },
  }

  res.status(ok ? 200 : 503).json(report)
})
