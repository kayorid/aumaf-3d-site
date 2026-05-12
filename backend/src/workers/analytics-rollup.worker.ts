import type { Job } from 'bullmq'
import { logger } from '../config/logger'
import { createQueue, createWorker } from '../lib/queue'
import { rollupRange, pruneRealtime } from '../services/analytics-rollup.service'
import { registerWorker } from './index'

export const ANALYTICS_ROLLUP_QUEUE = 'analytics-rollup'

export type AnalyticsRollupJobData =
  | { kind: 'hourly' }
  | { kind: 'daily' }
  | { kind: 'realtime-prune' }
  | { kind: 'backfill'; fromIso: string; toIso: string }

export const analyticsRollupQueue = createQueue<AnalyticsRollupJobData>(ANALYTICS_ROLLUP_QUEUE, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  },
})

export async function processAnalyticsRollup(job: Job<AnalyticsRollupJobData>) {
  const data = job.data
  switch (data.kind) {
    case 'hourly': {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 86_400_000)
      const r = await rollupRange(yesterday, now)
      logger.info({ jobId: job.id, ...r }, 'Hourly roll-up done')
      return r
    }
    case 'daily': {
      // Fecha ontem definitivamente (após 00:05 UTC)
      const now = new Date()
      const yesterday = new Date(now.getTime() - 86_400_000)
      const r = await rollupRange(yesterday, yesterday)
      logger.info({ jobId: job.id, ...r }, 'Daily roll-up done')
      return r
    }
    case 'realtime-prune': {
      const r = await pruneRealtime()
      logger.debug({ jobId: job.id, ...r }, 'Realtime prune done')
      return r
    }
    case 'backfill': {
      const r = await rollupRange(new Date(data.fromIso), new Date(data.toIso))
      logger.info({ jobId: job.id, ...r }, 'Backfill roll-up done')
      return r
    }
  }
}

const worker = createWorker<AnalyticsRollupJobData>(ANALYTICS_ROLLUP_QUEUE, processAnalyticsRollup, {
  concurrency: 1,
  autorun: false,
})

registerWorker({ name: ANALYTICS_ROLLUP_QUEUE, worker, queue: analyticsRollupQueue })

const REPEAT_KEY = {
  hourly: 'rollup-hourly',
  daily: 'rollup-daily',
  realtimePrune: 'realtime-prune',
}

/** Registra schedules repetíveis. Chamado uma vez no boot. */
export async function scheduleAnalyticsRollups() {
  await analyticsRollupQueue.add(
    'hourly',
    { kind: 'hourly' },
    { repeat: { pattern: '0 * * * *' }, jobId: REPEAT_KEY.hourly },
  )
  await analyticsRollupQueue.add(
    'daily',
    { kind: 'daily' },
    { repeat: { pattern: '5 0 * * *' }, jobId: REPEAT_KEY.daily },
  )
  await analyticsRollupQueue.add(
    'realtime-prune',
    { kind: 'realtime-prune' },
    { repeat: { pattern: '* * * * *' }, jobId: REPEAT_KEY.realtimePrune },
  )
  logger.info('Analytics rollup schedules registered')
}
