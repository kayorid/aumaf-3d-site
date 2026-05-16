import { env } from '../config/env'
import { logger } from '../config/logger'

/**
 * Push de URLs recém-publicadas para o protocolo IndexNow (Bing, Yandex,
 * Seznam, Naver). Best-effort: nunca lança — falhas só logam.
 *
 * Setup necessário em produção:
 *   1. INDEXNOW_KEY no env (gerar com `openssl rand -hex 16`).
 *   2. Servir o arquivo público `<KEY>.txt` cujo conteúdo é a própria chave
 *      em https://<host>/<KEY>.txt — verifica propriedade do domínio.
 *   3. INDEXNOW_HOST opcional (default: derivado de PUBLIC_BLOG_BASE_URL).
 *
 * Spec: https://www.indexnow.org/documentation
 */
export async function pingIndexNow(urls: string[]): Promise<void> {
  if (!env.INDEXNOW_KEY) {
    logger.debug('IndexNow: INDEXNOW_KEY ausente — ping ignorado')
    return
  }
  if (urls.length === 0) return

  const host = env.INDEXNOW_HOST
    ?? (env.PUBLIC_BLOG_BASE_URL ? new URL(env.PUBLIC_BLOG_BASE_URL).host : undefined)
  if (!host) {
    logger.warn('IndexNow: host não configurado (INDEXNOW_HOST ou PUBLIC_BLOG_BASE_URL)')
    return
  }

  const body = {
    host,
    key: env.INDEXNOW_KEY,
    keyLocation: `https://${host}/${env.INDEXNOW_KEY}.txt`,
    urlList: urls,
  }

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    })
    // IndexNow retorna 200 (aceito), 202 (aceito mas em validação) ou 4xx.
    if (res.status >= 200 && res.status < 300) {
      logger.info({ host, count: urls.length, status: res.status }, 'IndexNow ping ok')
    } else {
      logger.warn({ host, count: urls.length, status: res.status }, 'IndexNow ping não-ok')
    }
  } catch (err) {
    // Falha de rede / timeout não pode bloquear publicação.
    logger.warn({ err, host, count: urls.length }, 'IndexNow ping falhou')
  }
}
