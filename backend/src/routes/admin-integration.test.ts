import request from 'supertest'
import { sign } from 'jsonwebtoken'
import { createApp } from '../app'

jest.mock('../lib/prisma', () => ({
  prisma: {
    integrationSecret: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn().mockResolvedValue({}),
    },
    botyoWebhookDelivery: {
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('../services/integration-config.service', () => ({
  getBotyioConfig: jest.fn(),
  getBotyioConfigDto: jest.fn(),
  setBotyioField: jest.fn().mockResolvedValue(undefined),
  ensurePubSubSubscribed: jest.fn().mockResolvedValue(undefined),
  invalidateLocalCache: jest.fn(),
  BOTYIO_PROVIDER: 'botyio',
  BOTYIO_KEYS: { BASE_URL: 'BASE_URL', API_KEY: 'API_KEY', WEBHOOK_SECRET: 'WEBHOOK_SECRET', ENABLED: 'ENABLED' },
}))

jest.mock('../services/botyio.service', () => ({
  ...jest.requireActual('../services/botyio.service'),
  applyBotyoEvent: jest.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require('../lib/prisma')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const integrationConfig = require('../services/integration-config.service')

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { env } = require('../config/env')

function adminCookie(role: 'ADMIN' | 'EDITOR' = 'ADMIN', userId = 'user-admin-1') {
  prisma.user.findUnique.mockResolvedValue({
    id: userId,
    email: 'admin@aumaf.com.br',
    name: 'Admin',
    role,
    active: true,
  })
  const token = sign({ sub: userId, email: 'admin@aumaf.com.br', role }, env.JWT_SECRET, {
    expiresIn: '1h',
  })
  return `aumaf_session=${token}`
}

const baseDto = {
  enabled: false,
  baseUrl: 'https://api.botyio.com',
  apiKey: { masked: '', isSet: false, updatedAt: null, updatedBy: null },
  webhookSecret: { masked: '', isSet: false, updatedAt: null, updatedBy: null },
  callbackUrl: 'http://localhost:3000/api/v1/leads/botyio-status',
  baseUrlUpdatedAt: null,
  enabledUpdatedAt: null,
}

beforeEach(() => {
  jest.clearAllMocks()
  integrationConfig.getBotyioConfigDto.mockResolvedValue(baseDto)
  integrationConfig.getBotyioConfig.mockResolvedValue({
    enabled: false,
    baseUrl: 'https://api.botyio.com',
    apiKey: null,
    webhookSecret: null,
    meta: {},
  })
})

describe('GET /api/v1/admin/integrations/botyio', () => {
  const app = createApp()

  it('retorna 401 sem cookie de auth', async () => {
    await request(app).get('/api/v1/admin/integrations/botyio').expect(401)
  })

  it('retorna 403 para usuário não-ADMIN (R10)', async () => {
    await request(app)
      .get('/api/v1/admin/integrations/botyio')
      .set('Cookie', adminCookie('EDITOR'))
      .expect(403)
  })

  it('retorna DTO mascarado para ADMIN', async () => {
    const res = await request(app)
      .get('/api/v1/admin/integrations/botyio')
      .set('Cookie', adminCookie())
      .expect(200)

    expect(res.body.status).toBe('ok')
    expect(res.body.data.callbackUrl).toContain('/api/v1/leads/botyio-status')
    expect(res.body.data.apiKey).toEqual({
      masked: '',
      isSet: false,
      updatedAt: null,
      updatedBy: null,
    })
  })

  it('NUNCA retorna plaintext na resposta GET (R13)', async () => {
    integrationConfig.getBotyioConfigDto.mockResolvedValue({
      ...baseDto,
      apiKey: { masked: '••••abcd', isSet: true, updatedAt: '2026-05-06T10:00:00Z', updatedBy: 'u1' },
    })
    const res = await request(app)
      .get('/api/v1/admin/integrations/botyio')
      .set('Cookie', adminCookie())
      .expect(200)
    const body = JSON.stringify(res.body)
    expect(body).not.toMatch(/bty_lds_[a-zA-Z0-9]+/)
    expect(body).toContain('••••abcd')
  })
})

describe('PUT /api/v1/admin/integrations/botyio', () => {
  const app = createApp()

  it('rejeita 400 quando body vazio (R3 schema)', async () => {
    await request(app)
      .put('/api/v1/admin/integrations/botyio')
      .set('Cookie', adminCookie())
      .send({})
      .expect(422)
  })

  it('rejeita 400 com apiKey curta', async () => {
    await request(app)
      .put('/api/v1/admin/integrations/botyio')
      .set('Cookie', adminCookie())
      .send({ apiKey: 'curta' })
      .expect(422)
  })

  it('atualiza enabled + apiKey, chama setBotyioField com userId', async () => {
    await request(app)
      .put('/api/v1/admin/integrations/botyio')
      .set('Cookie', adminCookie('ADMIN', 'admin-7'))
      .send({ enabled: true, apiKey: 'bty_lds_brand_new_key_value' })
      .expect(200)

    expect(integrationConfig.setBotyioField).toHaveBeenCalledWith('enabled', true, 'admin-7')
    expect(integrationConfig.setBotyioField).toHaveBeenCalledWith(
      'apiKey',
      'bty_lds_brand_new_key_value',
      'admin-7',
    )
  })

  it('403 para EDITOR no PUT', async () => {
    await request(app)
      .put('/api/v1/admin/integrations/botyio')
      .set('Cookie', adminCookie('EDITOR'))
      .send({ enabled: true })
      .expect(403)
  })
})

describe('POST /api/v1/admin/integrations/botyio/test', () => {
  const app = createApp()

  it('retorna ok=false sem chave configurada', async () => {
    const res = await request(app)
      .post('/api/v1/admin/integrations/botyio/test')
      .set('Cookie', adminCookie())
      .send({})
      .expect(200)

    expect(res.body.ok).toBe(false)
    expect(res.body.message).toMatch(/Nenhuma API key/)
  })

  it('faz fetch real à Botyio quando há apiKey no body', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 200,
      ok: true,
    } as Response)

    const res = await request(app)
      .post('/api/v1/admin/integrations/botyio/test')
      .set('Cookie', adminCookie())
      .send({ apiKey: 'bty_lds_test_provided' })
      .expect(200)

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/leads?limit=1'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-API-Key': 'bty_lds_test_provided' }),
      }),
    )
    expect(res.body.ok).toBe(true)
    expect(res.body.status).toBe(200)
    fetchSpy.mockRestore()
  })

  it('reporta mensagem específica para 401 (key inválida)', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 401,
      ok: false,
    } as Response)

    const res = await request(app)
      .post('/api/v1/admin/integrations/botyio/test')
      .set('Cookie', adminCookie())
      .send({ apiKey: 'bty_lds_invalid' })
      .expect(200)

    expect(res.body.ok).toBe(false)
    expect(res.body.status).toBe(401)
    expect(res.body.message).toMatch(/inválida/i)
    fetchSpy.mockRestore()
  })

  it('NÃO persiste apiKey quando passada no body do test (R5)', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({ status: 200, ok: true } as Response)

    await request(app)
      .post('/api/v1/admin/integrations/botyio/test')
      .set('Cookie', adminCookie())
      .send({ apiKey: 'bty_lds_test_provided' })
      .expect(200)

    expect(integrationConfig.setBotyioField).not.toHaveBeenCalled()
  })
})

describe('GET /api/v1/admin/integrations/botyio/deliveries', () => {
  const app = createApp()

  it('retorna últimas N entregas mapeadas (R7)', async () => {
    prisma.botyoWebhookDelivery.findMany.mockResolvedValue([
      {
        id: 'cl_a',
        deliveryId: 'del_1',
        event: 'whatsapp.sent',
        receivedAt: new Date('2026-05-06T10:00:00Z'),
      },
      {
        id: 'cl_b',
        deliveryId: 'del_2',
        event: 'lead.registered',
        receivedAt: new Date('2026-05-06T09:00:00Z'),
      },
    ])

    const res = await request(app)
      .get('/api/v1/admin/integrations/botyio/deliveries?limit=10')
      .set('Cookie', adminCookie())
      .expect(200)

    expect(res.body.data).toHaveLength(2)
    expect(res.body.data[0].event).toBe('whatsapp.sent')
    expect(prisma.botyoWebhookDelivery.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, orderBy: { receivedAt: 'desc' } }),
    )
  })

  it('clamp em limit fora do range', async () => {
    prisma.botyoWebhookDelivery.findMany.mockResolvedValue([])
    await request(app)
      .get('/api/v1/admin/integrations/botyio/deliveries?limit=999')
      .set('Cookie', adminCookie())
      .expect(200)
    expect(prisma.botyoWebhookDelivery.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 }),
    )
  })
})
