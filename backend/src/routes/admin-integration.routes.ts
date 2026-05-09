import { Router } from 'express'
import { requireAuth, requireRole } from '../middlewares/require-auth'
import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import { env } from '../config/env'
import {
  UpdateBotyioConfigSchema,
  TestBotyioConnectionSchema,
} from '@aumaf/shared'
import {
  getBotyioConfig,
  getBotyioConfigDto,
  setBotyioField,
} from '../services/integration-config.service'

export const adminIntegrationRoutes = Router()

adminIntegrationRoutes.use(requireAuth, requireRole('ADMIN'))

adminIntegrationRoutes.get('/botyio', async (_req, res, next) => {
  try {
    const dto = await getBotyioConfigDto()
    res.json({ status: 'ok', data: dto })
  } catch (err) {
    next(err)
  }
})

adminIntegrationRoutes.put('/botyio', async (req, res, next) => {
  try {
    const input = UpdateBotyioConfigSchema.parse(req.body)
    const userId = req.user?.id ?? null
    const fieldsChanged: string[] = []

    if (input.baseUrl !== undefined) {
      await setBotyioField('baseUrl', input.baseUrl, userId)
      fieldsChanged.push('baseUrl')
    }
    if (input.enabled !== undefined) {
      await setBotyioField('enabled', input.enabled, userId)
      fieldsChanged.push('enabled')
    }
    if (input.apiKey !== undefined) {
      await setBotyioField('apiKey', input.apiKey, userId)
      fieldsChanged.push('apiKey')
    }
    if (input.webhookSecret !== undefined) {
      await setBotyioField('webhookSecret', input.webhookSecret, userId)
      fieldsChanged.push('webhookSecret')
    }

    logger.info(
      {
        tag: 'audit:integration-secret',
        provider: 'botyio',
        action: 'UPDATE',
        fieldsChanged,
        userId,
        userEmail: req.user?.email ?? null,
        ip: req.ip,
      },
      'Botyio config atualizado',
    )

    const dto = await getBotyioConfigDto()
    res.json({ status: 'ok', data: dto })
  } catch (err) {
    next(err)
  }
})

adminIntegrationRoutes.post('/botyio/test', async (req, res, next) => {
  try {
    const input = TestBotyioConnectionSchema.parse(req.body ?? {})
    const current = await getBotyioConfig()
    const apiKey = input.apiKey ?? current.apiKey
    const baseUrl = input.baseUrl ?? current.baseUrl

    if (!apiKey) {
      res.json({
        ok: false,
        status: null,
        message: 'Nenhuma API key configurada para testar.',
        latencyMs: 0,
      })
      return
    }

    const start = Date.now()
    let httpStatus: number | null = null
    let ok = false
    let message = 'Conexão estabelecida com sucesso.'

    try {
      // Probe um endpoint real autenticado: GET /v1/leads?limit=1.
      // 200 = ok; 401 = key inválida; 404 = endpoint mudou no provider.
      const probe = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/leads?limit=1`, {
        method: 'GET',
        headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
        signal: AbortSignal.timeout(5_000),
      })
      httpStatus = probe.status
      ok = probe.status >= 200 && probe.status < 400
      if (probe.status === 401) {
        message = 'API key inválida ou sem permissão.'
      } else if (!ok) {
        message = `Botyio respondeu HTTP ${probe.status}.`
      }
    } catch (err) {
      ok = false
      const raw = err instanceof Error ? err.message : 'erro desconhecido'
      // Sanitiza: nunca expor stack ou caminhos internos
      message = raw.includes('aborted') ? 'Timeout (5s) ao contatar Botyio.' : `Falha de rede: ${raw.slice(0, 80)}`
    }

    const latencyMs = Date.now() - start
    logger.info(
      { tag: 'audit:integration-secret', provider: 'botyio', action: 'TEST', ok, httpStatus, latencyMs },
      'Botyio test connection',
    )

    res.json({ ok, status: httpStatus, message, latencyMs })
  } catch (err) {
    next(err)
  }
})

adminIntegrationRoutes.get('/botyio/deliveries', async (req, res, next) => {
  try {
    const limitRaw = req.query.limit
    const limit = Math.min(Math.max(parseInt(typeof limitRaw === 'string' ? limitRaw : '10', 10) || 10, 1), 50)
    const rows = await prisma.botyoWebhookDelivery.findMany({
      orderBy: { receivedAt: 'desc' },
      take: limit,
      select: { id: true, deliveryId: true, event: true, receivedAt: true },
    })
    res.json({
      status: 'ok',
      data: rows.map((r) => ({
        id: r.id,
        deliveryId: r.deliveryId,
        event: r.event,
        receivedAt: r.receivedAt.toISOString(),
      })),
    })
  } catch (err) {
    next(err)
  }
})

// helper export para usar em outros pontos (ex: settings page do admin)
export function getBotyioCallbackUrl(): string {
  return `${env.BACKEND_URL.replace(/\/$/, '')}/api/v1/leads/botyio-status`
}
