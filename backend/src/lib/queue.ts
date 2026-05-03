import { Queue, Worker, type Processor, type WorkerOptions, type QueueOptions, type JobsOptions } from 'bullmq'
import { getRedis } from './redis'
import { logger } from '../config/logger'

export const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: { count: 50 },
  removeOnFail: { count: 100 },
}

export interface CreateQueueOptions<T> extends Partial<QueueOptions> {
  defaultJobOptions?: JobsOptions
}

export function createQueue<DataT = unknown, ResultT = unknown, NameT extends string = string>(
  name: string,
  opts: CreateQueueOptions<DataT> = {},
): Queue<DataT, ResultT, NameT> {
  const { defaultJobOptions, ...rest } = opts
  const queue = new Queue<DataT, ResultT, NameT>(name, {
    connection: getRedis(),
    ...rest,
    defaultJobOptions: { ...DEFAULT_JOB_OPTIONS, ...(defaultJobOptions ?? {}) },
  })

  queue.on('error', (err) => {
    logger.error({ err, queue: name }, 'Queue error')
  })

  return queue
}

export interface CreateWorkerOptions extends Partial<WorkerOptions> {
  concurrency?: number
}

export function createWorker<DataT = unknown, ResultT = unknown, NameT extends string = string>(
  name: string,
  processor: Processor<DataT, ResultT, NameT>,
  opts: CreateWorkerOptions = {},
): Worker<DataT, ResultT, NameT> {
  const worker = new Worker<DataT, ResultT, NameT>(name, processor, {
    connection: getRedis(),
    concurrency: opts.concurrency ?? 5,
    ...opts,
  })

  worker.on('ready', () => logger.info({ queue: name }, 'Worker ready'))
  worker.on('active', (job) => logger.debug({ queue: name, jobId: job.id }, 'Job active'))
  worker.on('completed', (job) =>
    logger.info({ queue: name, jobId: job.id, attempts: job.attemptsMade }, 'Job completed'),
  )
  worker.on('failed', (job, err) =>
    logger.error(
      { queue: name, jobId: job?.id, attempts: job?.attemptsMade, err: err.message },
      'Job failed',
    ),
  )
  worker.on('error', (err) => logger.error({ queue: name, err }, 'Worker error'))

  return worker
}
