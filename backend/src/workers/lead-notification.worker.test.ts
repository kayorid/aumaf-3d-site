jest.mock('../config/env', () => ({
  env: {
    REDIS_URL: 'redis://localhost:6379',
    EMAIL_TRANSPORT: 'console',
    EMAIL_FROM: 'AUMAF 3D <noreply@test.com>',
    ADMIN_NOTIFICATION_EMAIL: 'admin@aumaf.com.br',
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

const findUniqueMock = jest.fn()
jest.mock('../lib/prisma', () => ({ prisma: { lead: { findUnique: findUniqueMock } } }))

const sendEmailMock = jest.fn().mockResolvedValue(undefined)
jest.mock('../services/email.service', () => ({ sendEmail: sendEmailMock }))

import { processLeadNotification } from './lead-notification.worker'

describe('lead-notification worker', () => {
  beforeEach(() => {
    findUniqueMock.mockReset()
    sendEmailMock.mockClear()
  })

  function makeJob(leadId = 'lead-123') {
    return { id: 'job-1', data: { leadId } } as never
  }

  it('envia email ao admin quando lead existe', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'lead-123',
      name: 'João Silva',
      email: 'joao@empresa.com',
      phone: '+5516999990000',
      message: 'Preciso de 50 peças.',
      source: 'site-aumaf-3d',
      createdAt: new Date('2026-05-03T15:30:00Z'),
    })

    await processLeadNotification(makeJob())

    expect(sendEmailMock).toHaveBeenCalledTimes(1)
    const arg = sendEmailMock.mock.calls[0][0]
    expect(arg.to).toBe('admin@aumaf.com.br')
    expect(arg.subject).toContain('João Silva')
    expect(arg.text).toContain('joao@empresa.com')
    expect(arg.text).toContain('+5516999990000')
    expect(arg.text).toContain('Preciso de 50 peças.')
    expect(arg.replyTo).toBe('joao@empresa.com')
  })

  it('skip silencioso quando lead não existe', async () => {
    findUniqueMock.mockResolvedValue(null)
    await processLeadNotification(makeJob())
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('lida com lead sem telefone/mensagem (placeholder)', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'lead-x',
      name: 'Ana',
      email: 'ana@x.com',
      phone: null,
      message: null,
      source: null,
      createdAt: new Date(),
    })
    await processLeadNotification(makeJob('lead-x'))
    const arg = sendEmailMock.mock.calls[0][0]
    expect(arg.text).toContain('(não informado)')
    expect(arg.text).toContain('(sem mensagem)')
  })
})

describe('lead-notification worker — sem ADMIN_NOTIFICATION_EMAIL', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.doMock('../config/env', () => ({
      env: { REDIS_URL: 'redis://localhost:6379', ADMIN_NOTIFICATION_EMAIL: undefined },
    }))
    jest.doMock('../config/logger', () => ({
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
    }))
    jest.doMock('../lib/redis', () => ({ getRedis: jest.fn(() => ({})), createIORedis: jest.fn(() => ({})) }))
    jest.doMock('bullmq', () => ({
      Queue: jest.fn().mockImplementation(() => ({ add: jest.fn(), close: jest.fn(), on: jest.fn() })),
      Worker: jest.fn().mockImplementation(() => ({ on: jest.fn(), isRunning: () => false, run: jest.fn(), close: jest.fn() })),
    }))
    jest.doMock('../lib/prisma', () => ({ prisma: { lead: { findUnique: jest.fn() } } }))
    jest.doMock('../services/email.service', () => ({ sendEmail: jest.fn() }))
  })

  it('skip sem disparar email quando admin email não configurado', async () => {
    const mod = require('./lead-notification.worker')
    const sendEmail = require('../services/email.service').sendEmail
    await mod.processLeadNotification({ id: 'j', data: { leadId: 'l' } } as never)
    expect(sendEmail).not.toHaveBeenCalled()
  })
})
