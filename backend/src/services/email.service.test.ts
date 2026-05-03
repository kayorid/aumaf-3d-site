import { sendEmail, getEmailTransport, resetEmailTransport } from './email.service'

jest.mock('../config/env', () => ({
  env: {
    EMAIL_TRANSPORT: 'console',
    EMAIL_FROM: 'AUMAF 3D <noreply@test.com>',
    EMAIL_SMTP_HOST: undefined,
    EMAIL_SMTP_PORT: 587,
    EMAIL_SMTP_USER: undefined,
    EMAIL_SMTP_PASS: undefined,
    EMAIL_SMTP_SECURE: false,
  },
}))

jest.mock('../config/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

describe('email.service', () => {
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    resetEmailTransport()
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('seleciona transport console quando EMAIL_TRANSPORT=console', () => {
    const transport = getEmailTransport()
    expect(transport.name).toBe('console')
  })

  it('console transport imprime payload formatado', async () => {
    await sendEmail({
      to: 'admin@aumaf.com.br',
      subject: 'Novo lead: João',
      text: 'Mensagem completa.',
    })
    const calls = consoleSpy.mock.calls.flat().join('\n')
    expect(calls).toContain('Subject: Novo lead: João')
    expect(calls).toContain('To:      admin@aumaf.com.br')
    expect(calls).toContain('Mensagem completa.')
  })

  it('respeita replyTo quando fornecido', async () => {
    await sendEmail({
      to: 'admin@aumaf.com.br',
      subject: 'X',
      text: 'Y',
      replyTo: 'lead@empresa.com',
    })
    const calls = consoleSpy.mock.calls.flat().join('\n')
    expect(calls).toContain('Reply-To: lead@empresa.com')
  })

  it('cacheia transport entre chamadas (singleton)', () => {
    const a = getEmailTransport()
    const b = getEmailTransport()
    expect(a).toBe(b)
  })
})

describe('email.service stub transport', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.doMock('../config/env', () => ({
      env: { EMAIL_TRANSPORT: 'stub', EMAIL_FROM: 'x' },
    }))
    jest.doMock('../config/logger', () => ({
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
    }))
  })

  it('stub apenas loga warn sem efeito', async () => {
    const mod = require('./email.service')
    mod.resetEmailTransport()
    const logger = require('../config/logger').logger
    await mod.sendEmail({ to: 'x@y.z', subject: 's', text: 't' })
    expect(logger.warn).toHaveBeenCalled()
  })
})
