import crypto from 'node:crypto'
import { env } from '../config/env'

/**
 * Hash determinístico de IP (SHA-256 com salt do ambiente) — usado em
 * consent logs e DSR para auditoria sem expor IP em claro.
 * Retorna os primeiros 32 hex chars (128 bits — colisão astronomicamente baixa).
 */
export function hashIp(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(`${ip}:${env.ANALYTICS_IP_SALT}`)
    .digest('hex')
    .slice(0, 32)
}

/**
 * Extrai o IP do request respeitando proxies (X-Forwarded-For).
 */
export function extractIp(req: { headers?: Record<string, unknown>; ip?: string; socket?: { remoteAddress?: string } }): string | null {
  const fwd = req.headers?.['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0]!.trim()
  }
  return req.ip ?? req.socket?.remoteAddress ?? null
}
