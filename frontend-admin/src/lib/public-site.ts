/**
 * Resolve a URL pública do site (frontend-public) a partir do contexto runtime.
 *
 * Estratégia:
 * 1. Em prod, deriva do hostname do admin: `admin-aumaf.kayoridolfi.ai`
 *    → `aumaf.kayoridolfi.ai` (substitui prefixo `admin-`).
 * 2. Em dev, usa VITE_PUBLIC_URL (geralmente http://localhost:4321).
 * 3. Fallback duro: localhost:4321.
 *
 * Isso evita que o admin precise de coordenação de env var no CD para cada
 * domínio novo — basta o admin estar em `admin-<hostname-do-site>`.
 */
export function publicSiteUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host !== 'localhost' && host !== '127.0.0.1' && host.startsWith('admin-')) {
      return `${window.location.protocol}//${host.replace(/^admin-/, '')}`
    }
    if (host === 'admin.aumaf.com.br') return 'https://aumaf.com.br'
  }
  const fromEnv = import.meta.env.VITE_PUBLIC_URL as string | undefined
  return fromEnv || 'http://localhost:4321'
}

export function publicPostUrl(slug: string): string {
  return `${publicSiteUrl().replace(/\/$/, '')}/blog/${slug}`
}
