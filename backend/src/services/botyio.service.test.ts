import { syncLeadToBotyo, applyBotyoEvent, BotyoRetryableError } from './botyio.service'
import { prisma } from '../lib/prisma'
import { env } from '../config/env'

jest.mock('../lib/prisma', () => ({
  prisma: {
    lead: {
      update: jest.fn(),
    },
  },
}))

const mockUpdate = prisma.lead.update as jest.Mock

const baseLead = {
  id: 'lead_test_001',
  name: 'João Silva',
  email: 'joao@test.com',
  phone: '(16) 99999-8888',
  message: 'Quero 50 peças em PLA',
  source: 'site-contato',
  createdAt: new Date('2026-05-03T12:00:00Z'),
  utmSource: 'google',
  utmMedium: 'cpc',
  utmCampaign: 'impressao3d',
  utmTerm: null,
  utmContent: null,
  referrer: 'https://google.com',
  landingPage: '/contato',
  botyoLeadId: null,
  botyoStatus: 'pending',
  botyoQueuedAt: null,
  botyoSentAt: null,
  botyoFailReason: null,
} as const

const originalEnv = { ...process.env }

beforeEach(() => {
  jest.clearAllMocks()
  ;(env as Record<string, unknown>).BOTYIO_ENABLED = 'true'
  ;(env as Record<string, unknown>).BOTYIO_API_KEY = 'bty_lds_testkey'
  ;(env as Record<string, unknown>).BOTYIO_BASE_URL = 'https://api.botyio.com'
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('syncLeadToBotyo', () => {
  it('retorna sem fazer fetch quando BOTYIO_ENABLED=false', async () => {
    ;(env as Record<string, unknown>).BOTYIO_ENABLED = 'false'
    const fetchSpy = jest.spyOn(global, 'fetch')

    await syncLeadToBotyo(baseLead as any)

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('202: atualiza botyoLeadId, botyoStatus=sent, botyoQueuedAt', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 202,
      ok: true,
      json: async () => ({
        data: {
          id: 'ldi_abc001',
          externalId: 'lead_test_001',
          status: 'queued',
          whatsapp: { willAttempt: true, reason: null },
          links: { self: '/v1/leads/ldi_abc001' },
        },
      }),
    } as Response)

    await syncLeadToBotyo(baseLead as any)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'lead_test_001' },
        data: expect.objectContaining({
          botyoLeadId: 'ldi_abc001',
          botyoStatus: 'sent',
          botyoQueuedAt: expect.any(Date),
        }),
      }),
    )
  })

  it('200 (idempotente): mesmo comportamento do 202', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({
        data: {
          id: 'ldi_abc001',
          externalId: 'lead_test_001',
          status: 'queued',
          whatsapp: { willAttempt: true, reason: null },
          links: { self: '/v1/leads/ldi_abc001' },
        },
      }),
    } as Response)

    await syncLeadToBotyo(baseLead as any)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ botyoStatus: 'sent' }),
      }),
    )
  })

  it('409: marca failed sem retentar', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 409,
      ok: false,
    } as Response)

    await syncLeadToBotyo(baseLead as any)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ botyoStatus: 'failed', botyoFailReason: '409: payload conflict' }),
      }),
    )
  })

  it('400: marca failed com mensagem de erro', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 400,
      ok: false,
      text: async () => '{"error":"VALIDATION_ERROR","message":"phone invalid"}',
    } as Response)

    await syncLeadToBotyo(baseLead as any)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          botyoStatus: 'failed',
          botyoFailReason: expect.stringContaining('400'),
        }),
      }),
    )
  })

  it('429: lança BotyoRetryableError', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 429,
      ok: false,
    } as Response)

    await expect(syncLeadToBotyo(baseLead as any)).rejects.toBeInstanceOf(BotyoRetryableError)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('500: lança BotyoRetryableError', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 500,
      ok: false,
    } as Response)

    await expect(syncLeadToBotyo(baseLead as any)).rejects.toBeInstanceOf(BotyoRetryableError)
  })

  it('network error: lança BotyoRetryableError', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('ECONNREFUSED'))

    await expect(syncLeadToBotyo(baseLead as any)).rejects.toBeInstanceOf(BotyoRetryableError)
  })

  it('envia X-Idempotency-Key com o lead.id', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 202,
      ok: true,
      json: async () => ({ data: { id: 'ldi_x', externalId: 'lead_test_001', status: 'queued', whatsapp: { willAttempt: true, reason: null }, links: { self: '' } } }),
    } as Response)

    await syncLeadToBotyo(baseLead as any)

    const [, options] = fetchSpy.mock.calls[0]
    const headers = options?.headers as Record<string, string>
    expect(headers['X-Idempotency-Key']).toBe('lead_test_001')
  })
})

describe('applyBotyoEvent', () => {
  const baseEvent = {
    deliveryId: 'del_001',
    occurredAt: '2026-05-03T12:05:00Z',
    lead: { id: 'ldi_abc001', externalId: 'lead_test_001', status: 'sent' },
  }

  it('lead.registered → botyoStatus=sent', async () => {
    await applyBotyoEvent({ ...baseEvent, event: 'lead.registered' })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ botyoStatus: 'sent' }) }),
    )
  })

  it('whatsapp.sent → botyoStatus=whatsapp_sent + botyoSentAt', async () => {
    await applyBotyoEvent({ ...baseEvent, event: 'whatsapp.sent' })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          botyoStatus: 'whatsapp_sent',
          botyoSentAt: new Date('2026-05-03T12:05:00Z'),
        }),
      }),
    )
  })

  it('whatsapp.delivered → botyoStatus=whatsapp_delivered', async () => {
    await applyBotyoEvent({ ...baseEvent, event: 'whatsapp.delivered' })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ botyoStatus: 'whatsapp_delivered' }) }),
    )
  })

  it('whatsapp.read → botyoStatus=whatsapp_read', async () => {
    await applyBotyoEvent({ ...baseEvent, event: 'whatsapp.read' })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ botyoStatus: 'whatsapp_read' }) }),
    )
  })

  it('whatsapp.failed → botyoStatus=failed + botyoFailReason', async () => {
    await applyBotyoEvent({ ...baseEvent, event: 'whatsapp.failed', errorReason: 'number_not_exists' })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          botyoStatus: 'failed',
          botyoFailReason: 'number_not_exists',
        }),
      }),
    )
  })

  it('lead.failed → botyoStatus=failed com fallback de errorReason', async () => {
    await applyBotyoEvent({ ...baseEvent, event: 'lead.failed' })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          botyoStatus: 'failed',
          botyoFailReason: 'Botyio lead.failed',
        }),
      }),
    )
  })

  it('usa externalId (não botyoLeadId) no where', async () => {
    await applyBotyoEvent({ ...baseEvent, event: 'whatsapp.read' })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'lead_test_001' } }),
    )
  })
})
