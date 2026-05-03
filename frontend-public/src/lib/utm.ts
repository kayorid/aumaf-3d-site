const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
const LANDING_PAGE_KEY = 'aumaf_landing_page'

export interface UtmData {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  referrer?: string
  landingPage?: string
}

export function captureUtm(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  let hasUtm = false

  UTM_KEYS.forEach((key) => {
    const value = params.get(key)
    if (value) {
      sessionStorage.setItem(key, value)
      hasUtm = true
    }
  })

  // Salva a landing page apenas na primeira visita da sessão
  if (!sessionStorage.getItem(LANDING_PAGE_KEY)) {
    sessionStorage.setItem(LANDING_PAGE_KEY, window.location.pathname + window.location.search)
  }

  if (hasUtm) {
    // Marca que esta sessão tem UTM para evitar sobrescrever em navegação interna
    sessionStorage.setItem('aumaf_has_utm', 'true')
  }
}

export function readUtm(): UtmData {
  if (typeof window === 'undefined') return {}

  const result: UtmData = {}

  const source = sessionStorage.getItem('utm_source')
  const medium = sessionStorage.getItem('utm_medium')
  const campaign = sessionStorage.getItem('utm_campaign')
  const term = sessionStorage.getItem('utm_term')
  const content = sessionStorage.getItem('utm_content')
  const landingPage = sessionStorage.getItem(LANDING_PAGE_KEY)

  if (source) result.utmSource = source
  if (medium) result.utmMedium = medium
  if (campaign) result.utmCampaign = campaign
  if (term) result.utmTerm = term
  if (content) result.utmContent = content
  if (landingPage) result.landingPage = landingPage
  if (document.referrer) result.referrer = document.referrer

  return result
}
