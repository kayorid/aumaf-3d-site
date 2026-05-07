import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'

const ORIGINAL_ENV = { ...process.env }

interface PrismaMock {
  integrationSecret: {
    findMany: jest.Mock
    findUnique: jest.Mock
    upsert: jest.Mock
    create: jest.Mock
  }
}

interface PubsubMock {
  publishIntegrationInvalidate: jest.Mock
  subscribeIntegrationInvalidate: jest.Mock
}

interface LoadedModules {
  svc: typeof import('./integration-config.service')
  crypto: typeof import('../lib/crypto')
  prisma: PrismaMock
  pubsub: PubsubMock
}

let tmpDir: string

function loadModulesWithMocks(envOverrides: Record<string, string> = {}): LoadedModules {
  jest.resetModules()
  process.env = {
    ...ORIGINAL_ENV,
    NODE_ENV: 'test',
    MASTER_KEY_PATH: join(tmpDir, 'absent.key'),
    MASTER_ENCRYPTION_KEY: randomBytes(32).toString('base64'),
    BOTYIO_BASE_URL: 'https://api.botyio.com',
    BOTYIO_API_KEY: 'env_fallback_apikey',
    BOTYIO_WEBHOOK_SECRET: 'env_fallback_secret',
    BOTYIO_ENABLED: 'false',
    BACKEND_URL: 'http://localhost:3000',
    ...envOverrides,
  }

  const prismaMock: PrismaMock = {
    integrationSecret: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
    },
  }
  const pubsubMock: PubsubMock = {
    publishIntegrationInvalidate: jest.fn().mockResolvedValue(undefined),
    subscribeIntegrationInvalidate: jest.fn().mockResolvedValue(undefined),
  }

  jest.doMock('../lib/prisma', () => ({ prisma: prismaMock }))
  jest.doMock('../lib/redis-pubsub', () => pubsubMock)

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const svc = require('./integration-config.service') as typeof import('./integration-config.service')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('../lib/crypto') as typeof import('../lib/crypto')
  return { svc, crypto, prisma: prismaMock, pubsub: pubsubMock }
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'aumaf-svc-'))
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
  process.env = { ...ORIGINAL_ENV }
})

describe('integration-config.service', () => {
  it('lê do env quando DB está vazio (R8/R9 fallback)', async () => {
    const { svc, prisma } = loadModulesWithMocks()
    prisma.integrationSecret.findMany.mockResolvedValue([])

    const cfg = await svc.getBotyioConfig()
    expect(cfg.enabled).toBe(false)
    expect(cfg.baseUrl).toBe('https://api.botyio.com')
    expect(cfg.apiKey).toBe('env_fallback_apikey')
    expect(cfg.webhookSecret).toBe('env_fallback_secret')
  })

  it('preferência DB sobre env quando ambos existem (R8)', async () => {
    const { svc, crypto, prisma } = loadModulesWithMocks()
    const enc = crypto.encryptValue('db_value_apikey')
    prisma.integrationSecret.findMany.mockResolvedValue([
      {
        provider: 'botyio',
        key: 'API_KEY',
        ciphertext: enc.ciphertext,
        iv: enc.iv,
        authTag: enc.authTag,
        isSensitive: true,
        lastFour: 'ikey',
        updatedBy: 'user-1',
        updatedAt: new Date('2026-05-06T10:00:00Z'),
      },
    ])

    const cfg = await svc.getBotyioConfig()
    expect(cfg.apiKey).toBe('db_value_apikey')
    expect(cfg.webhookSecret).toBe('env_fallback_secret')
  })

  it('cache hit: segunda chamada não toca o DB', async () => {
    const { svc, prisma } = loadModulesWithMocks()
    prisma.integrationSecret.findMany.mockResolvedValue([])

    await svc.getBotyioConfig()
    await svc.getBotyioConfig()

    expect(prisma.integrationSecret.findMany).toHaveBeenCalledTimes(1)
  })

  it('invalidateLocalCache força nova leitura', async () => {
    const { svc, prisma } = loadModulesWithMocks()
    prisma.integrationSecret.findMany.mockResolvedValue([])

    await svc.getBotyioConfig()
    svc.invalidateLocalCache('botyio')
    await svc.getBotyioConfig()

    expect(prisma.integrationSecret.findMany).toHaveBeenCalledTimes(2)
  })

  it('getBotyioConfigDto NUNCA retorna plaintext (R13)', async () => {
    const { svc, crypto, prisma } = loadModulesWithMocks()
    const plaintext = 'super_secret_plain_value_xyz9'
    const enc = crypto.encryptValue(plaintext)
    prisma.integrationSecret.findMany.mockResolvedValue([
      {
        provider: 'botyio',
        key: 'API_KEY',
        ciphertext: enc.ciphertext,
        iv: enc.iv,
        authTag: enc.authTag,
        isSensitive: true,
        lastFour: 'xyz9',
        updatedBy: 'user-1',
        updatedAt: new Date('2026-05-06T10:00:00Z'),
      },
    ])

    const dto = await svc.getBotyioConfigDto()
    const serialized = JSON.stringify(dto)
    expect(serialized).not.toContain(plaintext)
    expect(dto.apiKey.isSet).toBe(true)
    expect(dto.apiKey.masked).toMatch(/^•+xyz9$/)
    expect(dto.callbackUrl).toBe('http://localhost:3000/api/v1/leads/botyio-status')
  })

  it('setSecret persiste ciphertext + invalida cache + publica pub/sub (R3)', async () => {
    const { svc, prisma, pubsub } = loadModulesWithMocks()
    prisma.integrationSecret.findMany.mockResolvedValue([])

    await svc.setSecret({
      provider: 'botyio',
      key: 'API_KEY',
      value: 'novo_valor_super_secreto',
      userId: 'admin-1',
      isSensitive: true,
    })

    expect(prisma.integrationSecret.upsert).toHaveBeenCalledTimes(1)
    const args = prisma.integrationSecret.upsert.mock.calls[0][0]
    expect(args.where.provider_key).toEqual({ provider: 'botyio', key: 'API_KEY' })
    expect(args.create.lastFour).toBe('reto')
    const ciphertext = args.create.ciphertext as Buffer
    expect(ciphertext.toString('utf8')).not.toContain('novo_valor_super_secreto')
    expect(pubsub.publishIntegrationInvalidate).toHaveBeenCalledWith('botyio')
  })

  it('setBotyioField com enabled=true persiste como string "true" não-sensível', async () => {
    const { svc, prisma } = loadModulesWithMocks()
    await svc.setBotyioField('enabled', true, 'admin-1')

    const args = prisma.integrationSecret.upsert.mock.calls[0][0]
    expect(args.create.isSensitive).toBe(false)
    expect(args.create.lastFour).toBeNull()
    expect((args.create.ciphertext as Buffer).length).toBeGreaterThan(0)
  })
})
