jest.mock('../config/env', () => ({
  env: { REDIS_URL: 'redis://localhost:6379' },
}))

jest.mock('../config/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

const fakeRedis = { ping: jest.fn(), quit: jest.fn(), disconnect: jest.fn(), on: jest.fn() }
jest.mock('./redis', () => ({
  getRedis: jest.fn(() => fakeRedis),
  createIORedis: jest.fn(() => fakeRedis),
}))

const queueOnSpy = jest.fn()
const workerOnSpy = jest.fn()
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation((name: string, opts: unknown) => ({
    name,
    opts,
    on: queueOnSpy,
    add: jest.fn(),
    close: jest.fn(),
  })),
  Worker: jest.fn().mockImplementation((name: string, processor: unknown, opts: unknown) => ({
    name,
    processor,
    opts,
    on: workerOnSpy,
    isRunning: () => false,
    run: jest.fn(),
    close: jest.fn(),
  })),
}))

import { Queue, Worker } from 'bullmq'
import { createQueue, createWorker, DEFAULT_JOB_OPTIONS } from './queue'

describe('queue factory', () => {
  beforeEach(() => {
    queueOnSpy.mockClear()
    workerOnSpy.mockClear()
    ;(Queue as unknown as jest.Mock).mockClear()
    ;(Worker as unknown as jest.Mock).mockClear()
  })

  it('createQueue aplica defaults consistentes', () => {
    createQueue('my-queue')
    const call = (Queue as unknown as jest.Mock).mock.calls[0]
    expect(call[0]).toBe('my-queue')
    expect(call[1].defaultJobOptions).toEqual(DEFAULT_JOB_OPTIONS)
    expect(call[1].connection).toBe(fakeRedis)
  })

  it('createQueue aceita override de defaultJobOptions', () => {
    createQueue('q2', { defaultJobOptions: { attempts: 5 } })
    const call = (Queue as unknown as jest.Mock).mock.calls[0]
    expect(call[1].defaultJobOptions.attempts).toBe(5)
    expect(call[1].defaultJobOptions.backoff).toEqual(DEFAULT_JOB_OPTIONS.backoff)
  })

  it('createQueue registra listener de erro', () => {
    createQueue('q3')
    expect(queueOnSpy).toHaveBeenCalledWith('error', expect.any(Function))
  })

  it('createWorker aplica concurrency default 5', () => {
    const proc = jest.fn()
    createWorker('w1', proc)
    const call = (Worker as unknown as jest.Mock).mock.calls[0]
    expect(call[2].concurrency).toBe(5)
  })

  it('createWorker registra listeners observáveis', () => {
    createWorker('w2', jest.fn())
    const events = workerOnSpy.mock.calls.map((c) => c[0])
    expect(events).toEqual(expect.arrayContaining(['ready', 'completed', 'failed', 'error']))
  })

  it('createWorker respeita concurrency customizado', () => {
    createWorker('w3', jest.fn(), { concurrency: 10 })
    const call = (Worker as unknown as jest.Mock).mock.calls[0]
    expect(call[2].concurrency).toBe(10)
  })
})
