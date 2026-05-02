import request from 'supertest'
import { createApp } from './app'

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

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const app = createApp()
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.timestamp).toBeDefined()
  })
})
