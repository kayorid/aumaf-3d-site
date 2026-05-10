/**
 * Cliente HTTP para o backend da AUMAF 3D — usado pelo blog dinâmico.
 *
 * Em build time (SSG), a base URL aponta para o backend local ou de produção via env.
 * Em runtime SSR, idem.
 *
 * Boundary: nunca expor endpoints autenticados aqui.
 */
import type {
  PostPublicDto,
  PublicPostListResponse,
  PublicSettingsDto,
} from '@aumaf/shared'

const DEFAULT_BASE = 'http://localhost:3000'
const API_PREFIX = '/api/v1'

// Aceita PUBLIC_API_URL como origem (ex.: https://api-aumaf.kayoridolfi.ai)
// OU já com sufixo /api/v1 (compat retroativa). Sempre normaliza para origem,
// e o prefixo /api/v1 é acrescentado pelos paths abaixo.
const RAW_BASE = (
  import.meta.env.PUBLIC_API_URL ||
  process.env.PUBLIC_API_URL ||
  DEFAULT_BASE
).replace(/\/$/, '')

const BASE_URL = RAW_BASE.endsWith(API_PREFIX)
  ? RAW_BASE.slice(0, -API_PREFIX.length)
  : RAW_BASE

interface FetchOptions {
  /** Cache hint para o fetch interno do Astro (build time) */
  next?: { revalidate?: number }
  /** Headers extras */
  headers?: Record<string, string>
}

async function apiGet<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = `${BASE_URL}${API_PREFIX}${path}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json', ...options.headers },
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error(`NOT_FOUND: ${path}`)
    throw new Error(`API ${res.status}: ${url}`)
  }

  return (await res.json()) as T
}

interface ApiSuccess<T> {
  status: 'ok'
  data: T
}

export async function fetchPublicPosts(params: {
  page?: number
  pageSize?: number
  category?: string
  featured?: boolean
} = {}): Promise<PublicPostListResponse> {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.pageSize) qs.set('pageSize', String(params.pageSize))
  if (params.category) qs.set('category', params.category)
  if (params.featured !== undefined) qs.set('featured', String(params.featured))

  const query = qs.toString() ? `?${qs.toString()}` : ''
  // Endpoint público responde direto (sem envelope { status, data }) para listagem
  return await apiGet<PublicPostListResponse>(`/public/posts${query}`)
}

export async function fetchPublicPost(slug: string): Promise<PostPublicDto | null> {
  try {
    return await apiGet<PostPublicDto>(`/public/posts/${encodeURIComponent(slug)}`)
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('NOT_FOUND')) return null
    throw err
  }
}

export async function fetchPublicSlugs(): Promise<string[]> {
  const res = await apiGet<ApiSuccess<string[]>>('/public/slugs')
  return res.data
}

export async function fetchPublicSettings(): Promise<PublicSettingsDto> {
  try {
    const res = await apiGet<ApiSuccess<PublicSettingsDto>>('/public/settings')
    return res.data
  } catch {
    // Em build time sem backend disponível, retorna settings vazias para não quebrar
    return {
      ga4MeasurementId: null,
      clarityProjectId: null,
      facebookPixelId: null,
      gtmContainerId: null,
      customHeadScripts: null,
      customBodyScripts: null,
    }
  }
}
