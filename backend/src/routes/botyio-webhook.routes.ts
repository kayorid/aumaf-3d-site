import { Router } from 'express'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import { env } from '../config/env'
import { applyBotyoEvent, type BotyoWebhookEvent } from '../services/botyio.service'

export const botyioWebhookRoutes = Router()

botyioWebhookRoutes.post('/', async (req, res) => {
  // req.body é Buffer (express.raw aplicado em app.ts antes de express.json)
  const sig = req.headers['x-botyo-signature'] as string | undefined
  if (!sig) {
    logger.warn('Botyio webhook: missing signature')
    return res.sendStatus(401)
  }

  const secret = env.BOTYIO_WEBHOOK_SECRET
  if (!secret) {
    logger.error('BOTYIO_WEBHOOK_SECRET not configured')
    return res.sendStatus(500)
  }

  const rawBody = req.body as Buffer
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex')

  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)

  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    logger.warn({ sig: sig.slice(0, 16) }, 'Botyio webhook: invalid signature')
    return res.sendStatus(401)
  }

  let event: BotyoWebhookEvent
  try {
    event = JSON.parse(rawBody.toString('utf8')) as BotyoWebhookEvent
  } catch {
    return res.sendStatus(400)
  }

  if (!event.deliveryId || !event.event) {
    return res.sendStatus(400)
  }

  // Idempotência: se já processamos este deliveryId, retorna 200 sem reprocessar
  const existing = await prisma.botyoWebhookDelivery.findUnique({
    where: { deliveryId: event.deliveryId },
  })
  if (existing) {
    logger.debug({ deliveryId: event.deliveryId }, 'Botyio webhook: duplicate delivery — ignoring')
    return res.sendStatus(200)
  }

  await prisma.botyoWebhookDelivery.create({
    data: {
      deliveryId: event.deliveryId,
      event: event.event,
      payload: event as object,
    },
  })

  try {
    await applyBotyoEvent(event)
  } catch (err) {
    logger.error({ deliveryId: event.deliveryId, event: event.event, err }, 'Botyio webhook: applyEvent failed')
    // Retorna 200 para não causar retentativas infinitas de eventos não-aplicáveis
    // (ex: externalId não encontrado = lead deletada)
    return res.sendStatus(200)
  }

  return res.sendStatus(200)
})
