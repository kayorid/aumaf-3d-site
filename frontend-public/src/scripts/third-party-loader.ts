/**
 * Loader consent-aware de scripts de terceiros — LGPD.
 *
 * Princípio: NADA do GA4 / Clarity / Meta Pixel é injetado no DOM até que o
 * usuário consinta com a categoria correspondente (analytics ou marketing).
 *
 * O banner `CookieConsent.astro` persiste a escolha em `localStorage.aumaf_consent_v1`
 * e dispara `window.dispatchEvent(new CustomEvent('aumaf:consent', { detail }))`
 * — esse loader escuta o evento e também relê o storage no boot (caso o usuário
 * já tenha consentido em uma visita anterior).
 *
 * Consent Mode v2: o `<head>` em `Base.astro` declara default `denied` para
 * todas as categorias Google ANTES desse loader. Quando o consentimento é
 * concedido, chamamos `gtag('consent', 'update', ...)` para promover as flags.
 */

interface PublicSettings {
  gtmContainerId: string | null
  ga4MeasurementId: string | null
  clarityProjectId: string | null
  facebookPixelId: string | null
}

interface Categories {
  necessary: true
  functional: boolean
  analytics: boolean
  marketing: boolean
}

declare global {
  interface Window {
    __aumafPublicSettings?: PublicSettings
    __aumafLoaded?: { gtm?: boolean; ga4?: boolean; clarity?: boolean; pixel?: boolean }
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

function getSettings(): PublicSettings {
  return (
    window.__aumafPublicSettings ?? {
      gtmContainerId: null,
      ga4MeasurementId: null,
      clarityProjectId: null,
      facebookPixelId: null,
    }
  )
}

function readConsent(): Categories | null {
  try {
    const raw = localStorage.getItem('aumaf_consent_v1')
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<Categories> & { necessary?: boolean }
    return {
      necessary: true,
      functional: !!p.functional,
      analytics: !!p.analytics,
      marketing: !!p.marketing,
    }
  } catch {
    return null
  }
}

function ensureLoadedFlag(): NonNullable<Window['__aumafLoaded']> {
  if (!window.__aumafLoaded) window.__aumafLoaded = {}
  return window.__aumafLoaded
}

function injectScript(src: string, attrs: Record<string, string> = {}): void {
  const s = document.createElement('script')
  s.async = true
  s.src = src
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v)
  document.head.appendChild(s)
}

function loadGtm(containerId: string): void {
  const flags = ensureLoadedFlag()
  if (flags.gtm) return
  flags.gtm = true
  ;(function (w: Window & typeof globalThis, d: Document, s: string, l: string, i: string) {
    ;(w as unknown as Record<string, unknown[]>)[l] =
      ((w as unknown as Record<string, unknown[]>)[l] as unknown[]) || []
    ;((w as unknown as Record<string, unknown[]>)[l] as unknown[]).push({
      'gtm.start': Date.now(),
      event: 'gtm.js',
    })
    const f = d.getElementsByTagName(s)[0]
    const j = d.createElement(s) as HTMLScriptElement
    const dl = l !== 'dataLayer' ? '&l=' + l : ''
    j.async = true
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl
    f.parentNode?.insertBefore(j, f)
  })(window, document, 'script', 'dataLayer', containerId)
}

function loadGa4(measurementId: string): void {
  const flags = ensureLoadedFlag()
  if (flags.ga4) return
  flags.ga4 = true
  injectScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`)
  window.gtag?.('js', new Date())
  window.gtag?.('config', measurementId, { anonymize_ip: true })
}

function loadClarity(projectId: string): void {
  const flags = ensureLoadedFlag()
  if (flags.clarity) return
  flags.clarity = true
  ;(function (c: Window & typeof globalThis, l: Document, a: string, r: string, i: string) {
    ;(c as unknown as Record<string, unknown>)[a] =
      ((c as unknown as Record<string, unknown>)[a] as unknown) ||
      function (...args: unknown[]) {
        const q = (((c as unknown as Record<string, unknown>)[a] as unknown as { q?: unknown[][] }).q =
          ((c as unknown as Record<string, unknown>)[a] as unknown as { q?: unknown[][] }).q || [])
        q.push(args)
      }
    const t = l.createElement(r) as HTMLScriptElement
    t.async = true
    t.src = 'https://www.clarity.ms/tag/' + i
    const y = l.getElementsByTagName(r)[0]
    y.parentNode?.insertBefore(t, y)
  })(window, document, 'clarity', 'script', projectId)
}

function loadFacebookPixel(pixelId: string): void {
  const flags = ensureLoadedFlag()
  if (flags.pixel) return
  flags.pixel = true
  /* eslint-disable @typescript-eslint/no-explicit-any */
  ;(function (f: any, b: any, e: string, v: string) {
    if (f.fbq) return
    const n: any = (f.fbq = function () {
      // eslint-disable-next-line prefer-rest-params
      n.callMethod ? n.callMethod.apply(n, arguments as unknown as unknown[]) : n.queue.push(arguments)
    })
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    const t = b.createElement(e) as HTMLScriptElement
    t.async = true
    t.src = v
    const s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  window.fbq?.('init', pixelId)
  window.fbq?.('track', 'PageView')
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

function applyConsent(categories: Categories): void {
  const settings = getSettings()

  // Google Consent Mode v2 — promove flags conforme as categorias.
  window.gtag?.('consent', 'update', {
    analytics_storage: categories.analytics ? 'granted' : 'denied',
    ad_storage: categories.marketing ? 'granted' : 'denied',
    ad_user_data: categories.marketing ? 'granted' : 'denied',
    ad_personalization: categories.marketing ? 'granted' : 'denied',
    functionality_storage: categories.functional ? 'granted' : 'denied',
    security_storage: 'granted',
  })

  if (categories.analytics) {
    if (settings.gtmContainerId) loadGtm(settings.gtmContainerId)
    else if (settings.ga4MeasurementId) loadGa4(settings.ga4MeasurementId)
    if (settings.clarityProjectId) loadClarity(settings.clarityProjectId)
  }
  if (categories.marketing && settings.facebookPixelId) {
    loadFacebookPixel(settings.facebookPixelId)
  }
}

// Boot: se já há consentimento gravado, aplica imediatamente.
const initial = readConsent()
if (initial) applyConsent(initial)

// Listener para mudanças via banner.
window.addEventListener('aumaf:consent', (ev) => {
  const detail = (ev as CustomEvent).detail as Partial<Categories> | undefined
  if (!detail) return
  applyConsent({
    necessary: true,
    functional: !!detail.functional,
    analytics: !!detail.analytics,
    marketing: !!detail.marketing,
  })
})

export {}
