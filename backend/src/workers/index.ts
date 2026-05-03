import type { Queue, Worker } from 'bullmq'
import { logger } from '../config/logger'
import { closeRedis } from '../lib/redis'

interface RegisteredWorker {
  name: string
  worker: Worker
  queue: Queue
}

const registry: RegisteredWorker[] = []

export function registerWorker(entry: RegisteredWorker): void {
  registry.push(entry)
}

export function listRegisteredWorkers(): ReadonlyArray<RegisteredWorker> {
  return registry
}

export function getQueue(name: string): Queue | undefined {
  return registry.find((r) => r.name === name)?.queue
}

export async function bootWorkers(): Promise<void> {
  if (registry.length === 0) {
    logger.warn('No workers registered — boot is a no-op')
    return
  }
  await Promise.all(
    registry.map(async ({ name, worker }) => {
      if (!worker.isRunning()) await worker.run()
      logger.info({ queue: name }, 'Worker booted')
    }),
  )
  logger.info({ workers: registry.map((r) => r.name) }, `Booted ${registry.length} worker(s)`)
}

export async function shutdownWorkers(timeoutMs = 10_000): Promise<void> {
  if (registry.length === 0) return
  logger.info(`Shutting down ${registry.length} worker(s) (timeout ${timeoutMs}ms)...`)

  const closes = registry.map(async ({ name, worker, queue }) => {
    try {
      await Promise.race([
        worker.close(),
        new Promise((_, rej) => setTimeout(() => rej(new Error('worker close timeout')), timeoutMs)),
      ])
      await queue.close()
      logger.info({ queue: name }, 'Worker closed')
    } catch (err) {
      logger.error({ queue: name, err }, 'Worker close failed')
    }
  })

  await Promise.allSettled(closes)
  await closeRedis()
}

export interface QueueStats {
  name: string
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
}

export async function getQueueStats(name: string): Promise<QueueStats | null> {
  const q = getQueue(name)
  if (!q) return null
  const counts = await q.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed')
  return {
    name,
    waiting: counts.waiting ?? 0,
    active: counts.active ?? 0,
    completed: counts.completed ?? 0,
    failed: counts.failed ?? 0,
    delayed: counts.delayed ?? 0,
  }
}
