import type { APIRoute } from 'astro'

/**
 * Endpoint dinâmico para verificação de propriedade do IndexNow.
 *
 * Cada motor de busca compatível (Bing, Yandex, Seznam, Naver) requisita
 * `https://<host>/<KEY>.txt` para confirmar que a chave usada nos pings
 * pertence ao dono do domínio. O conteúdo deve ser exatamente a chave.
 *
 * Lê PUBLIC_INDEXNOW_KEY (exposto ao runtime via PUBLIC_ prefix do Astro);
 * qualquer outro nome de arquivo .txt nesse path cai aqui — retorna 404
 * para não vazar nenhuma outra info.
 */
export const prerender = false

export const GET: APIRoute = ({ params }) => {
  const expected = import.meta.env.PUBLIC_INDEXNOW_KEY as string | undefined
  if (!expected) {
    return new Response('IndexNow not configured', { status: 404 })
  }
  const requested = params.key
  if (requested !== expected) {
    return new Response('Not found', { status: 404 })
  }
  return new Response(expected, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
