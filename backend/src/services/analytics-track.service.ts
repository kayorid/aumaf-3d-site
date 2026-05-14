import { randomUUID } from 'node:crypto'
import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'
import type { AnalyticsEventType } from '@aumaf/shared'

/**
 * Server-side analytics tracking — emite um evento direto no banco (não passa
 * pelo SDK do cliente). Usado para marcar mutações críticas do backend
 * (lead criado, post publicado, DSR concluído) que não têm equivalente
 * client-side garantido — usuário pode fechar a aba antes de o submit
 * confirmar, ou o lead pode chegar via Botyio/webhook.
 *
 * Por design:
 * - sessionId/visitorId nulos (não associa a uma sessão de browser)
 * - source = 'server' em properties para filtrar no dashboard
 * - URL/path = 'server://' + tipo (não-navegável)
 * - Best-effort: nunca falha o fluxo principal — apenas loga warn
 *
 * NUNCA inclua PII (email, telefone, CPF) em `properties` — use referências
 * estáveis como leadId/postId.
 */
export async function serverTrack(
  type: AnalyticsEventType,
  name: string,
  properties: Record<string, unknown> = {},
  refs: { leadId?: string | null } = {},
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventId: randomUUID(),
        occurredAt: new Date(),
        receivedAt: new Date(),
        sessionId: `server:${randomUUID().slice(0, 8)}`,
        visitorId: `server:${randomUUID().slice(0, 8)}`,
        type,
        name,
        url: `server://${name}`,
        path: `/server/${name}`,
        leadId: refs.leadId ?? null,
        properties: { ...properties, source: 'server' } as object,
      },
    })
  } catch (err) {
    logger.warn({ err, type, name, refs }, 'serverTrack falhou — evento perdido (não bloqueia fluxo)')
  }
}
