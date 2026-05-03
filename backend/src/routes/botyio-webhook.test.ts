import request from 'supertest'
import { createHmac } from 'node:crypto'
import { createApp } from '../app'
import { prisma } from '../lib/prisma'
import { env } from '../config/env'
import * as botyioService from '../services/botyio.service'

jest.mock('../lib/prisma', () => ({
  prisma: {
    botyoWebhookDelivery: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    lead: {
      update: jest.fn(),
    },
  },
}))

jest.mock('../services/botyio.service', () => ({
  ...jest.requireActual('../services/botyio.service'),
  applyBotyoEvent: jest.fn(),
}))

const mockFindUnique = prisma.botyoWebhookDelivery.findUnique as jest.Mock
const mockCreate = prisma.botyoWebhookDelivery.create as jest.Mock
const mockApply = botyioService.applyBotyoEvent as jest.Mock

const WEBHOOK_SECRET = 'whsec_testsecret0000000000000000000'

function sign(body: string): string {
  return 'sha256=' + createHmac('sha256', WEBHOOK_SECRET).update(Buffer.from(body)).digest('hex')
}

const validEvent = {
  event: 'whatsapp.sent',
  deliveryId: 'del_test_001',
  occurredAt: '2026-05-03T12:00:00Z',
  lead: { id: 'ldi_abc001', externalId: 'lead_test_001', status: 'sent' },
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(env as Record<string, unknown>).BOTYIO_WEBHOOK_SECRET = WEBHOOK_SECRET
  mockFindUnique.mockResolvedValue(null)
  mockCreate.mockResolvedValue({})
  mockApply.mockResolvedValue(undefined)
})

describe('POST /api/v1/leads/botyio-status', () => {
  const app = createApp()

  it('retorna 401 sem header de assinatura', async () => {
    await request(app)
      .post('/api/v1/leads/botyio-status')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(validEvent))
      .expect(401)
  })

  it('retorna 401 com assinatura inválida', async () => {
    const body = JSON.stringify(validEvent)
    await request(app)
      .post('/api/v1/leads/botyio-status')
      .set('Content-Type', 'application/json')
      .set('X-Botyo-Signature', 'sha256=invalidsignature')
      .send(body)
      .expect(401)
  })

  it('retorna 200 com assinatura válida e processa evento', async () => {
    const body = JSON.stringify(validEvent)
    await request(app)
      .post('/api/v1/leads/botyio-status')
      .set('Content-Type', 'application/json')
      .set('X-Botyo-Signature', sign(body))
      .send(body)
      .expect(200)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deliveryId: 'del_test_001', event: 'whatsapp.sent' }),
      }),
    )
    expect(mockApply).toHaveBeenCalledWith(expect.objectContaining({ event: 'whatsapp.sent' }))
  })

  it('retorna 200 sem reprocessar deliveryId duplicado', async () => {
    mockFindUnique.mockResolvedValueOnce({ id: 'existing', deliveryId: 'del_test_001' })

    const body = JSON.stringify(validEvent)
    await request(app)
      .post('/api/v1/leads/botyio-status')
      .set('Content-Type', 'application/json')
      .set('X-Botyo-Signature', sign(body))
      .send(body)
      .expect(200)

    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockApply).not.toHaveBeenCalled()
  })

  it('retorna 200 mesmo quando applyBotyoEvent lança (lead não encontrada)', async () => {
    mockApply.mockRejectedValueOnce(new Error('Record not found'))

    const body = JSON.stringify(validEvent)
    await request(app)
      .post('/api/v1/leads/botyio-status')
      .set('Content-Type', 'application/json')
      .set('X-Botyo-Signature', sign(body))
      .send(body)
      .expect(200)
  })

  it('retorna 400 para body malformado (JSON inválido)', async () => {
    const body = 'not-json{'
    await request(app)
      .post('/api/v1/leads/botyio-status')
      .set('Content-Type', 'application/json')
      .set('X-Botyo-Signature', sign(body))
      .send(body)
      .expect(400)
  })

  it('processa todos os 7 tipos de evento sem erro', async () => {
    const events = [
      'lead.registered',
      'whatsapp.queued',
      'whatsapp.sent',
      'whatsapp.delivered',
      'whatsapp.read',
      'whatsapp.failed',
      'lead.failed',
    ]

    for (const event of events) {
      jest.clearAllMocks()
      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue({})
      mockApply.mockResolvedValue(undefined)

      const payload = { ...validEvent, event, deliveryId: `del_${event.replace('.', '_')}` }
      const body = JSON.stringify(payload)

      await request(app)
        .post('/api/v1/leads/botyio-status')
        .set('Content-Type', 'application/json')
        .set('X-Botyo-Signature', sign(body))
        .send(body)
        .expect(200)

      expect(mockApply).toHaveBeenCalledWith(expect.objectContaining({ event }))
    }
  })
})
