import { createIORedis } from './redis'
import { logger } from '../config/logger'

const CHANNEL_INTEGRATION_INVALIDATE = 'integration-secret:invalidate'

let publisher: ReturnType<typeof createIORedis> | null = null
let subscriber: ReturnType<typeof createIORedis> | null = null

function getPublisher() {
  if (!publisher) publisher = createIORedis()
  return publisher
}

function getSubscriber() {
  if (!subscriber) subscriber = createIORedis()
  return subscriber
}

export async function publishIntegrationInvalidate(provider: string): Promise<void> {
  const pub = getPublisher()
  await pub.publish(CHANNEL_INTEGRATION_INVALIDATE, JSON.stringify({ provider, ts: Date.now() }))
  logger.debug({ provider }, 'integration-secret invalidate publicado')
}

type InvalidateHandler = (provider: string) => void | Promise<void>

const handlers = new Set<InvalidateHandler>()
let subscribed = false

export async function subscribeIntegrationInvalidate(handler: InvalidateHandler): Promise<void> {
  handlers.add(handler)
  if (subscribed) return

  const sub = getSubscriber()
  await sub.subscribe(CHANNEL_INTEGRATION_INVALIDATE)
  sub.on('message', (channel, raw) => {
    if (channel !== CHANNEL_INTEGRATION_INVALIDATE) return
    try {
      const { provider } = JSON.parse(raw) as { provider: string }
      for (const h of handlers) {
        Promise.resolve(h(provider)).catch((err) =>
          logger.warn({ err, provider }, 'integration-invalidate handler falhou'),
        )
      }
    } catch (err) {
      logger.warn({ err, raw }, 'integration-invalidate payload inválido')
    }
  })
  subscribed = true
}

export async function closePubSub(): Promise<void> {
  await Promise.allSettled([publisher?.quit(), subscriber?.quit()])
  publisher = null
  subscriber = null
  subscribed = false
  handlers.clear()
}

export const __testing = { CHANNEL_INTEGRATION_INVALIDATE }
