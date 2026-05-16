import type { Job } from 'bullmq'
import type { CollectEventInput } from '@aumaf/shared'
import { logger } from '../config/logger'
import { createQueue, createWorker } from '../lib/queue'
import { ingestBatch, type IngestContext } from '../services/analytics-ingest.service'
import { registerWorker } from './index'

export const ANALYTICS_INGEST_QUEUE = 'analytics-ingest'

export interface AnalyticsIngestJobData {
  events: CollectEventInput[]
  ctx: IngestContext
}

export const analyticsIngestQueue = createQueue<AnalyticsIngestJobData>(ANALYTICS_INGEST_QUEUE, {
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 500 },
  },
})

export async function processAnalyticsIngest(job: Job<AnalyticsIngestJobData>): Promise<{ inserted: number; skipped: number }> {
  const { events, ctx } = job.data
  const result = await ingestBatch(events, ctx)
  logger.debug({ jobId: job.id, ...result, batch: events.length }, 'Analytics batch ingested')
  return result
}

const worker = createWorker<AnalyticsIngestJobData>(ANALYTICS_INGEST_QUEUE, processAnalyticsIngest, {
  concurrency: 5,
  autorun: false,
})

registerWorker({ name: ANALYTICS_INGEST_QUEUE, worker, queue: analyticsIngestQueue })

export async function enqueueAnalyticsBatch(data: AnalyticsIngestJobData): Promise<void> {
  await analyticsIngestQueue.add('ingest', data)
}
