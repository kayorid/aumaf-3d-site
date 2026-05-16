/**
 * Instagram feed via Behold.so.
 * Behold é APENAS fonte de dados (proxy legal da Instagram Graph API).
 * Renderização é 100% nossa — nunca usar widget JS / iframe / CSS deles.
 *
 * Mesma arquitetura de google-reviews.ts: SSR puro com cache em memória do
 * processo Astro (TTL 1h, igual ao ciclo de update do Behold no plano free).
 *
 * Resiliência: em caso de falha de rede / 5xx / timeout, retorna o último
 * snapshot válido se houver, ou null. Componente Astro deve esconder a seção
 * inteira quando o retorno for null/vazio (degrada silenciosamente).
 */

const BEHOLD_FEED_ID = import.meta.env.PUBLIC_BEHOLD_FEED_ID || ''

const PROFILE_URL = 'https://www.instagram.com/aumaf3d/'

export interface InstagramPost {
  id: string
  permalink: string
  mediaUrl: string
  thumbnailUrl: string
  mediaType: 'IMAGE' | 'CAROUSEL_ALBUM'
  caption: string
  timestamp: string
}

export interface InstagramFeedData {
  posts: InstagramPost[]
  profileUrl: string
  fetchedAt: string
}

interface BeholdPost {
  id: string
  permalink?: string
  mediaUrl?: string
  mediaType?: string
  sizes?: {
    medium?: { mediaUrl?: string }
    small?: { mediaUrl?: string }
    full?: { mediaUrl?: string }
  }
  thumbnailUrl?: string
  caption?: string
  prunedCaption?: string
  timestamp?: string
  children?: BeholdPost[]
}

interface BeholdResponse {
  posts?: BeholdPost[]
}

let cached: { data: InstagramFeedData | null; expiresAt: number } | null = null
const TTL_MS = 60 * 60 * 1000 // 1h — match Behold free tier update cadence

const FETCH_TIMEOUT_MS = 3000
const ACCEPTED_TYPES = new Set(['IMAGE', 'CAROUSEL_ALBUM'])

function pickThumbnail(p: BeholdPost): string {
  return (
    p.sizes?.medium?.mediaUrl ||
    p.sizes?.small?.mediaUrl ||
    p.thumbnailUrl ||
    p.sizes?.full?.mediaUrl ||
    p.mediaUrl ||
    ''
  )
}

function pickFullImage(p: BeholdPost): string {
  // Para CAROUSEL_ALBUM o Behold devolve a primeira imagem em mediaUrl;
  // children[0] cobre fallback raro.
  return (
    p.mediaUrl ||
    p.sizes?.full?.mediaUrl ||
    p.children?.[0]?.mediaUrl ||
    pickThumbnail(p)
  )
}

function normalizeCaption(raw: string | undefined): string {
  if (!raw) return ''
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function getInstagramFeed(): Promise<InstagramFeedData | null> {
  if (!BEHOLD_FEED_ID) {
    // Sem FEED_ID configurado — esconde seção sem ruído nos logs (build local antes do setup).
    return null
  }

  const now = Date.now()
  if (cached && cached.expiresAt > now) return cached.data

  const url = `https://feeds.behold.so/${BEHOLD_FEED_ID}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`Behold HTTP ${res.status}`)

    const json = (await res.json()) as BeholdResponse | BeholdPost[]
    const rawPosts: BeholdPost[] = Array.isArray(json) ? json : json.posts || []

    if (!Array.isArray(rawPosts)) throw new Error('Behold payload inválido')

    const posts: InstagramPost[] = rawPosts
      .filter((p) => p && p.id && ACCEPTED_TYPES.has((p.mediaType || '').toUpperCase()))
      .map((p) => ({
        id: p.id,
        permalink: p.permalink || PROFILE_URL,
        mediaUrl: pickFullImage(p),
        thumbnailUrl: pickThumbnail(p),
        mediaType: (p.mediaType?.toUpperCase() as InstagramPost['mediaType']) || 'IMAGE',
        caption: normalizeCaption(p.prunedCaption || p.caption),
        timestamp: p.timestamp || '',
      }))
      .filter((p) => p.thumbnailUrl)
      .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
      .slice(0, 8)

    if (posts.length === 0) throw new Error('Behold devolveu zero posts elegíveis')

    const data: InstagramFeedData = {
      posts,
      profileUrl: PROFILE_URL,
      fetchedAt: new Date().toISOString(),
    }
    cached = { data, expiresAt: now + TTL_MS }
    return data
  } catch (err) {
    console.warn('[instagram] fetch falhou:', (err as Error).message)
    if (cached?.data) return cached.data
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export function truncateCaption(text: string, max = 100): string {
  if (!text) return ''
  const oneLine = text.replace(/\s+/g, ' ').trim()
  if (oneLine.length <= max) return oneLine
  const slice = oneLine.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice
  return cut.replace(/[.,;:!?\s]+$/, '') + '…'
}

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatPostDate(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return DATE_FMT.format(date)
}
