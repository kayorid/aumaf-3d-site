import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import { encryptValue, decryptValue, lastFourOf, maskSecret } from '../lib/crypto'
import {
  publishIntegrationInvalidate,
  subscribeIntegrationInvalidate,
} from '../lib/redis-pubsub'
import { env } from '../config/env'
import type { BotyioConfigDto, SecretFieldDto } from '@aumaf/shared'

export const BOTYIO_PROVIDER = 'botyio'

export const BOTYIO_KEYS = {
  BASE_URL: 'BASE_URL',
  API_KEY: 'API_KEY',
  WEBHOOK_SECRET: 'WEBHOOK_SECRET',
  ENABLED: 'ENABLED',
} as const

const SENSITIVE_KEYS = new Set<string>([BOTYIO_KEYS.API_KEY, BOTYIO_KEYS.WEBHOOK_SECRET])

const CACHE_TTL_MS = 30_000

interface BotyioConfigInternal {
  enabled: boolean
  baseUrl: string
  apiKey: string | null
  webhookSecret: string | null
  meta: Record<string, { updatedAt: Date | null; updatedBy: string | null; lastFour: string | null }>
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<BotyioConfigInternal>>()

function cacheKeyFor(provider: string): string {
  return `config:${provider}`
}

export function invalidateLocalCache(provider: string): void {
  cache.delete(cacheKeyFor(provider))
  logger.debug({ provider }, 'integration-config cache local invalidado')
}

let pubsubSubscribed = false
export async function ensurePubSubSubscribed(): Promise<void> {
  if (pubsubSubscribed) return
  await subscribeIntegrationInvalidate((provider) => invalidateLocalCache(provider))
  pubsubSubscribed = true
}

async function readBotyioFromDb(): Promise<BotyioConfigInternal> {
  const rows = await prisma.integrationSecret.findMany({
    where: { provider: BOTYIO_PROVIDER },
  })
  const byKey = new Map(rows.map((r) => [r.key, r]))

  const decryptIfPresent = (key: string): string | null => {
    const row = byKey.get(key)
    if (!row) return null
    return decryptValue({
      ciphertext: Buffer.from(row.ciphertext),
      iv: Buffer.from(row.iv),
      authTag: Buffer.from(row.authTag),
    })
  }

  const baseUrl = decryptIfPresent(BOTYIO_KEYS.BASE_URL) ?? env.BOTYIO_BASE_URL
  const apiKey = decryptIfPresent(BOTYIO_KEYS.API_KEY) ?? env.BOTYIO_API_KEY ?? null
  const webhookSecret = decryptIfPresent(BOTYIO_KEYS.WEBHOOK_SECRET) ?? env.BOTYIO_WEBHOOK_SECRET ?? null
  const enabledRaw = decryptIfPresent(BOTYIO_KEYS.ENABLED) ?? env.BOTYIO_ENABLED
  const enabled = enabledRaw === 'true'

  const meta: BotyioConfigInternal['meta'] = {}
  for (const [k, row] of byKey.entries()) {
    meta[k] = {
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
      lastFour: row.lastFour,
    }
  }

  return { baseUrl, apiKey, webhookSecret, enabled, meta }
}

/** Internal — uso apenas em backend (worker, service Botyio). NUNCA expor via HTTP. */
export async function getBotyioConfig(): Promise<BotyioConfigInternal> {
  const key = cacheKeyFor(BOTYIO_PROVIDER)
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.data

  const data = await readBotyioFromDb()
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
  return data
}

function toSecretFieldDto(
  meta: BotyioConfigInternal['meta'],
  key: string,
  value: string | null,
): SecretFieldDto {
  const m = meta[key]
  const isSet = value !== null && value !== ''
  const last = m?.lastFour ?? (isSet && value ? lastFourOf(value) : null)
  return {
    masked: isSet ? maskSecret(value ?? '', 4).replace(/^•+/, '••••') : '',
    isSet,
    updatedAt: m?.updatedAt?.toISOString() ?? null,
    updatedBy: m?.updatedBy ?? null,
  }
}

/** Public — versão segura para a API admin. NUNCA contém plaintext de campos sensíveis. */
export async function getBotyioConfigDto(): Promise<BotyioConfigDto> {
  const cfg = await getBotyioConfig()
  const callbackUrl = `${env.BACKEND_URL.replace(/\/$/, '')}/api/v1/leads/botyio-status`

  return {
    enabled: cfg.enabled,
    baseUrl: cfg.baseUrl,
    apiKey: toSecretFieldDto(cfg.meta, BOTYIO_KEYS.API_KEY, cfg.apiKey),
    webhookSecret: toSecretFieldDto(cfg.meta, BOTYIO_KEYS.WEBHOOK_SECRET, cfg.webhookSecret),
    callbackUrl,
    baseUrlUpdatedAt: cfg.meta[BOTYIO_KEYS.BASE_URL]?.updatedAt?.toISOString() ?? null,
    enabledUpdatedAt: cfg.meta[BOTYIO_KEYS.ENABLED]?.updatedAt?.toISOString() ?? null,
  }
}

export interface SetSecretInput {
  provider: string
  key: string
  value: string
  userId?: string | null
  isSensitive?: boolean
}

export async function setSecret(input: SetSecretInput): Promise<void> {
  const isSensitive = input.isSensitive ?? SENSITIVE_KEYS.has(input.key)
  const enc = encryptValue(input.value)
  const lastFour = isSensitive ? lastFourOf(input.value) : null

  await prisma.integrationSecret.upsert({
    where: { provider_key: { provider: input.provider, key: input.key } },
    create: {
      provider: input.provider,
      key: input.key,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      authTag: enc.authTag,
      isSensitive,
      lastFour,
      updatedBy: input.userId ?? null,
    },
    update: {
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      authTag: enc.authTag,
      isSensitive,
      lastFour,
      updatedBy: input.userId ?? null,
    },
  })

  invalidateLocalCache(input.provider)
  await publishIntegrationInvalidate(input.provider)
}

export async function setBotyioField(
  field: 'baseUrl' | 'apiKey' | 'webhookSecret' | 'enabled',
  value: string | boolean,
  userId?: string | null,
): Promise<void> {
  const keyMap = {
    baseUrl: BOTYIO_KEYS.BASE_URL,
    apiKey: BOTYIO_KEYS.API_KEY,
    webhookSecret: BOTYIO_KEYS.WEBHOOK_SECRET,
    enabled: BOTYIO_KEYS.ENABLED,
  } as const

  const stringValue = typeof value === 'boolean' ? String(value) : value
  await setSecret({
    provider: BOTYIO_PROVIDER,
    key: keyMap[field],
    value: stringValue,
    userId,
    isSensitive: SENSITIVE_KEYS.has(keyMap[field]),
  })
}

/** Apenas para testes. */
export function __resetIntegrationConfigCache(): void {
  cache.clear()
  pubsubSubscribed = false
}
