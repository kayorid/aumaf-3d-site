/**
 * Google Reviews via Featurable.
 * Featurable é APENAS fonte de dados (proxy legal da Google Business Profile API).
 * Renderização é 100% nossa — nunca usar widget JS / iframe / CSS deles.
 */

const FEATURABLE_WIDGET_ID =
  import.meta.env.PUBLIC_FEATURABLE_WIDGET_ID ||
  'a12efbda-f40b-48fc-a8ff-724e904bee9d'

const PLACE_CID = '9655082316416517921'
const PLACE_FID = '0x94b8713868586eb9:0x86017404926c4521'

export interface Review {
  id: string
  authorName: string
  authorAvatar: string | null
  rating: number
  text: string
  publishedAt: string
  permalink: string | null
}

export interface ReviewsData {
  rating: number
  totalCount: number
  reviews: Review[]
  writeReviewUrl: string
  placeUrl: string
}

interface FeaturableResponse {
  success: boolean
  widget?: {
    reviews?: Array<{
      id: string
      author?: { name?: string; avatarUrl?: string | null }
      text?: string
      originalText?: string
      rating?: { value?: number; max?: number }
      publishedAt?: string
      url?: string | null
    }>
    gbpLocationSummary?: {
      reviewsCount?: number
      rating?: number
      writeAReviewUri?: string
    }
  }
}

const PLACE_URL = `https://www.google.com/maps?cid=${PLACE_CID}`
const FALLBACK_WRITE_URL = `https://search.google.com/local/writereview?placeid=&fid=${PLACE_FID}`

let cached: { data: ReviewsData | null; expiresAt: number } | null = null
const TTL_MS = 6 * 60 * 60 * 1000

export async function getReviews(): Promise<ReviewsData | null> {
  const now = Date.now()
  if (cached && cached.expiresAt > now) return cached.data

  const url = `https://featurable.com/api/v2/widgets/${FEATURABLE_WIDGET_ID}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`Featurable HTTP ${res.status}`)

    const json = (await res.json()) as FeaturableResponse
    if (!json.success || !json.widget) throw new Error('Featurable payload inválido')

    const summary = json.widget.gbpLocationSummary || {}
    const data: ReviewsData = {
      rating: typeof summary.rating === 'number' ? summary.rating : 0,
      totalCount: typeof summary.reviewsCount === 'number' ? summary.reviewsCount : 0,
      writeReviewUrl: summary.writeAReviewUri || FALLBACK_WRITE_URL,
      placeUrl: PLACE_URL,
      reviews: (json.widget.reviews || [])
        .filter((r) => (r.originalText || r.text || '').trim().length > 0)
        .map((r) => ({
          id: r.id,
          authorName: r.author?.name?.trim() || 'Cliente AUMAF',
          authorAvatar: r.author?.avatarUrl || null,
          rating: Math.max(0, Math.min(5, Math.round(r.rating?.value ?? 0))),
          text: (r.originalText || r.text || '').trim(),
          publishedAt: r.publishedAt || '',
          permalink: r.url || null,
        }))
        .sort((a, b) => (a.publishedAt > b.publishedAt ? -1 : 1)),
    }

    cached = { data, expiresAt: now + TTL_MS }
    return data
  } catch (err) {
    console.warn('[google-reviews] fetch falhou:', (err as Error).message)
    if (cached?.data) return cached.data
    return null
  } finally {
    clearTimeout(timeout)
  }
}

const RTF = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

export function formatRelative(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = date.getTime() - Date.now()
  const diffDays = Math.round(diffMs / 86_400_000)
  const absDays = Math.abs(diffDays)
  if (absDays < 30) return RTF.format(diffDays, 'day')
  const diffMonths = Math.round(diffDays / 30)
  if (Math.abs(diffMonths) < 12) return RTF.format(diffMonths, 'month')
  const diffYears = Math.round(diffDays / 365)
  return RTF.format(diffYears, 'year')
}

export function truncate(text: string, max = 220): { text: string; truncated: boolean } {
  if (text.length <= max) return { text, truncated: false }
  const slice = text.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice
  return { text: cut.replace(/[.,;:!?\s]+$/, '') + '…', truncated: true }
}

export function aggregateRatingSchema(data: ReviewsData) {
  return {
    '@type': 'AggregateRating',
    ratingValue: data.rating.toFixed(1),
    bestRating: '5',
    worstRating: '1',
    reviewCount: String(data.totalCount),
  }
}

export function reviewsSchema(data: ReviewsData) {
  return data.reviews.slice(0, 5).map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.authorName },
    datePublished: r.publishedAt,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(r.rating),
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: r.text,
  }))
}
