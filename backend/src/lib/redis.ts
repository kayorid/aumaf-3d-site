import IORedis, { type RedisOptions } from 'ioredis'
import { env } from '../config/env'
import { logger } from '../config/logger'

let cached: IORedis | null = null

export function createIORedis(overrides: Partial<RedisOptions> = {}): IORedis {
  const url = new URL(env.REDIS_URL)
  const client = new IORedis({
    host: url.hostname,
    port: Number(url.port || 6379),
    password: url.password || undefined,
    username: url.username || undefined,
    db: url.pathname && url.pathname !== '/' ? Number(url.pathname.slice(1)) : 0,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: false,
    ...overrides,
  })

  client.on('connect', () => logger.info('Redis connected'))
  client.on('ready', () => logger.debug('Redis ready'))
  client.on('error', (err) => logger.error({ err }, 'Redis error'))
  client.on('close', () => logger.warn('Redis connection closed'))
  client.on('reconnecting', (ms: number) => logger.warn({ ms }, 'Redis reconnecting'))

  return client
}

export function getRedis(): IORedis {
  if (!cached) cached = createIORedis()
  return cached
}

export async function pingRedis(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now()
  try {
    const client = getRedis()
    const reply = await client.ping()
    if (reply !== 'PONG') return { ok: false, latencyMs: Date.now() - start, error: `unexpected reply: ${reply}` }
    return { ok: true, latencyMs: Date.now() - start }
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function closeRedis(): Promise<void> {
  if (!cached) return
  try {
    await cached.quit()
  } catch (err) {
    logger.warn({ err }, 'Redis quit failed; forcing disconnect')
    cached.disconnect()
  } finally {
    cached = null
  }
}
