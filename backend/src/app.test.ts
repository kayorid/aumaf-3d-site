import request from 'supertest'

jest.mock('./config/env', () => ({
  env: {
    FRONTEND_ADMIN_URL: 'http://localhost:5174',
    FRONTEND_PUBLIC_URL: 'http://localhost:4321',
    LOG_FORMAT: 'text',
    STORAGE_DRIVER: 'fs',
    REDIS_URL: 'redis://localhost:6379',
    NODE_ENV: 'test',
    PORT: 3000,
    JWT_SECRET: 'test-secret-minimum-32-characters-here',
    JWT_EXPIRES_IN: '7d',
  },
}))

jest.mock('./config/logger', () => ({
  logger: require('pino')({ level: 'silent' }),
}))

jest.mock('./lib/prisma', () => ({
  prisma: { $queryRaw: jest.fn().mockResolvedValue([{ ok: 1 }]) },
}))

jest.mock('./lib/redis', () => ({
  pingRedis: jest.fn().mockResolvedValue({ ok: true, latencyMs: 1 }),
  getRedis: jest.fn(() => ({})),
}))

jest.mock('./workers', () => ({
  listRegisteredWorkers: () => [],
  getQueueStats: jest.fn(),
  registerWorker: jest.fn(),
  bootWorkers: jest.fn(),
  shutdownWorkers: jest.fn(),
}))

jest.mock('./workers/lead-notification.worker', () => ({
  enqueueLeadNotification: jest.fn(),
  leadNotificationQueue: {},
  LEAD_NOTIFICATION_QUEUE: 'lead-notification',
  processLeadNotification: jest.fn(),
}))

jest.mock('./workers/post-publish.worker', () => ({
  enqueuePostPublishWarmup: jest.fn(),
  postPublishQueue: {},
  POST_PUBLISH_QUEUE: 'post-publish-cache',
  processPostPublish: jest.fn(),
}))

import { createApp } from './app'

describe('GET /api/health (alias)', () => {
  it('returns status ok via alias legado', async () => {
    const app = createApp()
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.timestamp).toBeDefined()
  })

  it('returns status ok via /health canônico', async () => {
    const app = createApp()
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.services.db.status).toBe('up')
  })
})
