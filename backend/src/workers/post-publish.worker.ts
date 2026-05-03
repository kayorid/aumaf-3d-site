import type { Job } from 'bullmq'
import { logger } from '../config/logger'
import { env } from '../config/env'
import { createQueue, createWorker } from '../lib/queue'
import { registerWorker } from './index'

export interface PostPublishJobData {
  postId: string
  slug: string
}

export const POST_PUBLISH_QUEUE = 'post-publish-cache'

export const postPublishQueue = createQueue<PostPublishJobData>(POST_PUBLISH_QUEUE, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 30 },
    removeOnFail: { count: 50 },
  },
})

function getBlogBaseUrl(): string {
  return env.PUBLIC_BLOG_BASE_URL ?? env.FRONTEND_PUBLIC_URL
}

export async function processPostPublish(job: Job<PostPublishJobData>): Promise<void> {
  const { postId, slug } = job.data
  const base = getBlogBaseUrl().replace(/\/$/, '')
  const urls = [`${base}/blog`, `${base}/blog/${slug}`]

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const start = Date.now()
      const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'aumaf-cache-warmup/1.0' } })
      return { url, status: res.status, latencyMs: Date.now() - start }
    }),
  )

  const summary = results.map((r, i) =>
    r.status === 'fulfilled'
      ? { ok: r.value.status >= 200 && r.value.status < 400, ...r.value }
      : { url: urls[i], ok: false, error: String(r.reason) },
  )
  const allOk = summary.every((s) => s.ok)

  logger.info({ jobId: job.id, postId, slug, summary, allOk }, 'Post-publish cache warmup done')

  if (!allOk) {
    const failed = summary.filter((s) => !s.ok).map((s) => s.url)
    throw new Error(`Cache warmup failed for: ${failed.join(', ')}`)
  }
}

const worker = createWorker<PostPublishJobData>(POST_PUBLISH_QUEUE, processPostPublish, {
  concurrency: 2,
  autorun: false,
})

registerWorker({
  name: POST_PUBLISH_QUEUE,
  worker,
  queue: postPublishQueue,
})

export async function enqueuePostPublishWarmup(postId: string, slug: string): Promise<void> {
  await postPublishQueue.add('warmup', { postId, slug }, { jobId: `post-${postId}-${Date.now()}` })
}
