import request from 'supertest'
import express from 'express'

jest.mock('../config/env', () => ({
  env: { REDIS_URL: 'redis://localhost:6379' },
}))

jest.mock('../config/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

const queryRawMock = jest.fn()
jest.mock('../lib/prisma', () => ({
  prisma: { $queryRaw: queryRawMock },
}))

const pingRedisMock = jest.fn()
jest.mock('../lib/redis', () => ({ pingRedis: pingRedisMock, getRedis: jest.fn(() => ({})) }))

const listWorkersMock = jest.fn()
const getQueueStatsMock = jest.fn()
jest.mock('../workers', () => ({
  listRegisteredWorkers: listWorkersMock,
  getQueueStats: getQueueStatsMock,
}))

import { healthRoutes } from './health.routes'

function buildApp() {
  const app = express()
  app.use('/health', healthRoutes)
  return app
}

describe('GET /health', () => {
  beforeEach(() => {
    queryRawMock.mockReset()
    pingRedisMock.mockReset()
    listWorkersMock.mockReset()
    getQueueStatsMock.mockReset()
    listWorkersMock.mockReturnValue([])
  })

  it('200 com status ok quando todos serviços up', async () => {
    queryRawMock.mockResolvedValue([{ '?column?': 1 }])
    pingRedisMock.mockResolvedValue({ ok: true, latencyMs: 1 })

    const res = await request(buildApp()).get('/health')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.services.db.status).toBe('up')
    expect(res.body.services.redis.status).toBe('up')
    expect(res.body.uptimeSec).toBeGreaterThanOrEqual(0)
  })

  it('503 quando DB down', async () => {
    queryRawMock.mockRejectedValue(new Error('connect ECONNREFUSED'))
    pingRedisMock.mockResolvedValue({ ok: true, latencyMs: 1 })

    const res = await request(buildApp()).get('/health')

    expect(res.status).toBe(503)
    expect(res.body.status).toBe('degraded')
    expect(res.body.services.db.status).toBe('down')
    expect(res.body.services.db.error).toContain('ECONNREFUSED')
  })

  it('503 quando Redis down', async () => {
    queryRawMock.mockResolvedValue([{ ok: 1 }])
    pingRedisMock.mockResolvedValue({ ok: false, latencyMs: 100, error: 'redis offline' })

    const res = await request(buildApp()).get('/health')

    expect(res.status).toBe(503)
    expect(res.body.services.redis.status).toBe('down')
  })

  it('agrega contadores de queues registradas', async () => {
    queryRawMock.mockResolvedValue([])
    pingRedisMock.mockResolvedValue({ ok: true, latencyMs: 1 })
    listWorkersMock.mockReturnValue([{ name: 'lead-notification' }])
    getQueueStatsMock.mockResolvedValue({
      name: 'lead-notification',
      waiting: 2,
      active: 1,
      completed: 10,
      failed: 0,
      delayed: 0,
    })

    const res = await request(buildApp()).get('/health')

    expect(res.body.services.queues['lead-notification']).toMatchObject({
      status: 'active',
      waiting: 2,
      active: 1,
    })
  })
})
