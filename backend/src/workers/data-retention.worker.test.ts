jest.mock('../config/env', () => ({
  env: {
    REDIS_URL: 'redis://localhost:6379',
    LGPD_ANON_SALT: 'test-salt-123',
  },
}))

jest.mock('../config/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

jest.mock('../lib/redis', () => ({
  getRedis: jest.fn(() => ({})),
  createIORedis: jest.fn(() => ({})),
  pingRedis: jest.fn(),
  closeRedis: jest.fn(),
}))

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({ add: jest.fn(), close: jest.fn(), on: jest.fn() })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    isRunning: () => false,
    run: jest.fn(),
    close: jest.fn(),
  })),
}))

const analyticsDeleteMock = jest.fn()
const consentDeleteMock = jest.fn()
const dsrDeleteMock = jest.fn()
const leadFindManyMock = jest.fn()
const leadUpdateMock = jest.fn()

jest.mock('../lib/prisma', () => ({
  prisma: {
    analyticsEvent: { deleteMany: analyticsDeleteMock },
    consentLog: { deleteMany: consentDeleteMock },
    dataSubjectRequest: { deleteMany: dsrDeleteMock },
    lead: { findMany: leadFindManyMock, update: leadUpdateMock },
  },
}))

import { runRetentionSweep } from './data-retention.worker'

describe('data-retention worker', () => {
  beforeEach(() => {
    analyticsDeleteMock.mockReset().mockResolvedValue({ count: 42 })
    consentDeleteMock.mockReset().mockResolvedValue({ count: 7 })
    dsrDeleteMock.mockReset().mockResolvedValue({ count: 3 })
    leadFindManyMock.mockReset().mockResolvedValue([
      { id: 'l1', email: 'old@example.com', phone: '11999990000' },
      { id: 'l2', email: 'older@example.com', phone: null },
    ])
    leadUpdateMock.mockReset().mockResolvedValue({})
  })

  it('purges analytics, consents, completed DSRs and anonymizes old leads', async () => {
    const summary = await runRetentionSweep()

    expect(summary.analyticsEventsPurged).toBe(42)
    expect(summary.consentLogsPurged).toBe(7)
    expect(summary.dsrsPurged).toBe(3)
    expect(summary.leadsAnonymized).toBe(2)

    // Anonymization: name/email/phone substituídos.
    expect(leadUpdateMock).toHaveBeenCalledTimes(2)
    const firstCall = leadUpdateMock.mock.calls[0][0]
    expect(firstCall.where).toEqual({ id: 'l1' })
    expect(firstCall.data.email).toMatch(/^anon-[a-f0-9]+@anon\.aumaf3d\.local$/)
    expect(firstCall.data.name).toMatch(/^anon-[a-f0-9]+$/)
    expect(firstCall.data.message).toBeNull()
    expect(firstCall.data.phone).toMatch(/^anon-/)

    // Phone null preservado como null.
    const secondCall = leadUpdateMock.mock.calls[1][0]
    expect(secondCall.data.phone).toBeNull()

    // Thresholds: lead findMany usa createdAt < 5 anos atrás.
    const findArgs = leadFindManyMock.mock.calls[0][0]
    expect(findArgs.where.createdAt.lt).toBeInstanceOf(Date)
    const fiveYears = Date.now() - 5 * 365 * 24 * 60 * 60 * 1000
    expect((findArgs.where.createdAt.lt as Date).getTime()).toBeLessThan(fiveYears + 10 * 24 * 60 * 60 * 1000)
    expect(findArgs.where.email.not.startsWith).toBe('anon-')
  })
})
