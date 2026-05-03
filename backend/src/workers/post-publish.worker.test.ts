jest.mock('../config/env', () => ({
  env: {
    REDIS_URL: 'redis://localhost:6379',
    FRONTEND_PUBLIC_URL: 'http://public.test',
    PUBLIC_BLOG_BASE_URL: undefined,
  },
}))

jest.mock('../config/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

jest.mock('../lib/redis', () => ({
  getRedis: jest.fn(() => ({})),
  createIORedis: jest.fn(() => ({})),
}))

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({ add: jest.fn(), close: jest.fn(), on: jest.fn() })),
  Worker: jest.fn().mockImplementation(() => ({ on: jest.fn(), isRunning: () => false, run: jest.fn(), close: jest.fn() })),
}))

import { processPostPublish } from './post-publish.worker'

describe('post-publish worker', () => {
  const fetchMock = jest.fn()
  const originalFetch = global.fetch

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock as unknown as typeof fetch
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  function makeJob(postId = 'p1', slug = 'hello-world') {
    return { id: 'job-1', data: { postId, slug } } as never
  }

  it('aquece /blog e /blog/:slug do site público', async () => {
    fetchMock.mockResolvedValue({ status: 200 })
    await processPostPublish(makeJob('p1', 'novo-post'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenCalledWith('http://public.test/blog', expect.any(Object))
    expect(fetchMock).toHaveBeenCalledWith('http://public.test/blog/novo-post', expect.any(Object))
  })

  it('lança erro quando alguma URL retorna 5xx', async () => {
    fetchMock
      .mockResolvedValueOnce({ status: 200 })
      .mockResolvedValueOnce({ status: 500 })
    await expect(processPostPublish(makeJob())).rejects.toThrow(/Cache warmup failed/)
  })

  it('lança erro quando fetch rejeita', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))
    await expect(processPostPublish(makeJob())).rejects.toThrow(/Cache warmup failed/)
  })

  it('User-Agent identifica chamada de warmup', async () => {
    fetchMock.mockResolvedValue({ status: 200 })
    await processPostPublish(makeJob())
    const opts = fetchMock.mock.calls[0][1]
    expect(opts.headers['User-Agent']).toMatch(/aumaf-cache-warmup/)
  })
})
