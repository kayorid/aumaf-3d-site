/**
 * @aumaf/analytics-sdk
 *
 * SDK isomórfico de analytics próprio.
 * - Buffer 10 eventos / 2s → batch via navigator.sendBeacon (fallback fetch keepalive).
 * - sessionId em sessionStorage (expira ao fechar aba).
 * - visitorId em localStorage (persistente).
 * - Auto-tracking opcional: clicks (data-track), scroll depth, time on page, outbound.
 *
 * Catálogo de tipos e nomes vive em @aumaf/shared (analytics.ts).
 * Para registrar um novo evento: adicione data-track="event_name" ao elemento ou
 * chame track(type, name, properties) manualmente. NUNCA invente strings — registre
 * no catálogo antes (ver skill analytics-tagging).
 */

export interface AnalyticsConfig {
  endpoint?: string
  beaconEndpoint?: string
  debug?: boolean
  flushIntervalMs?: number
  maxBatchSize?: number
  autoTrack?: {
    pageviews?: boolean
    clicks?: boolean
    scroll?: boolean
    timeOnPage?: boolean
    outbound?: boolean
    forms?: boolean
  }
  /**
   * LGPD — quando `analytics:false` no consentimento do usuário, o SDK opera
   * em modo restrito: NÃO persiste visitorId em localStorage (UID gerado por
   * sessão de aba, em memória) e DESLIGA auto-tracking de clicks/scroll/forms
   * e time-on-page. Pageviews continuam sendo emitidos (legítimo interesse —
   * IP é hasheado server-side).
   */
  respectConsent?: boolean
}

export interface CollectEvent {
  eventId: string
  occurredAt: string
  sessionId: string
  visitorId: string
  type: string
  name?: string | null
  url: string
  path: string
  referrer?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  utmTerm?: string | null
  screenWidth?: number | null
  screenHeight?: number | null
  language?: string | null
  timezone?: string | null
  properties?: Record<string, unknown> | null
}

const DEFAULT_CONFIG: Required<Omit<AnalyticsConfig, 'autoTrack'>> & { autoTrack: Required<NonNullable<AnalyticsConfig['autoTrack']>> } = {
  endpoint: '/api/v1/analytics/collect',
  beaconEndpoint: '/api/v1/analytics/collect/beacon',
  debug: false,
  flushIntervalMs: 2000,
  maxBatchSize: 10,
  respectConsent: true,
  autoTrack: {
    pageviews: true,
    clicks: true,
    scroll: true,
    timeOnPage: true,
    outbound: true,
    forms: true,
  },
}

const SS_SESSION = 'aumaf_a_sid'
const LS_VISITOR = 'aumaf_a_vid'

interface State {
  cfg: typeof DEFAULT_CONFIG
  sessionId: string
  visitorId: string
  buffer: CollectEvent[]
  flushTimer: ReturnType<typeof setTimeout> | null
  lastUtm: Partial<Record<'utmSource' | 'utmMedium' | 'utmCampaign' | 'utmContent' | 'utmTerm', string>>
  scrollDepths: Set<number>
  lastPath: string | null
  pageStartTs: number
  timeOnPageTimer: ReturnType<typeof setInterval> | null
  lastEngagementSeconds: number
  hasFocus: boolean
  /** Categorias consentidas (LGPD). null = ainda não decidiu (assume modo restrito). */
  consent: { analytics: boolean; functional: boolean; marketing: boolean } | null
  respectConsent: boolean
}

let state: State | null = null

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function uuid(): string {
  if (isBrowser() && typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // fallback RFC4122 v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getOrCreate(storage: Storage, key: string, factory: () => string): string {
  try {
    const v = storage.getItem(key)
    if (v) return v
    const nv = factory()
    storage.setItem(key, nv)
    return nv
  } catch {
    return factory()
  }
}

/**
 * Lê o consentimento gravado pelo banner LGPD (chave `aumaf_consent_v1`).
 * Retorna null se ausente — interpretado como "modo restrito" pelo SDK.
 */
function readConsent(): State['consent'] {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem('aumaf_consent_v1')
    if (!raw) return null
    const p = JSON.parse(raw) as { analytics?: boolean; functional?: boolean; marketing?: boolean }
    return {
      analytics: !!p.analytics,
      functional: !!p.functional,
      marketing: !!p.marketing,
    }
  } catch {
    return null
  }
}

/** Retorna true se o SDK pode usar storage persistente e auto-tracking detalhado. */
function hasAnalyticsConsent(): boolean {
  if (!state) return false
  if (!state.respectConsent) return true
  return state.consent?.analytics === true
}

function parseUtm(url: URL): State['lastUtm'] {
  const out: State['lastUtm'] = {}
  const map: Record<string, keyof State['lastUtm']> = {
    utm_source: 'utmSource',
    utm_medium: 'utmMedium',
    utm_campaign: 'utmCampaign',
    utm_content: 'utmContent',
    utm_term: 'utmTerm',
  }
  for (const [param, key] of Object.entries(map)) {
    const v = url.searchParams.get(param)
    if (v) out[key] = v
  }
  return out
}

function buildEvent(type: string, name: string | null | undefined, properties: Record<string, unknown> | null | undefined): CollectEvent | null {
  if (!isBrowser() || !state) return null
  const loc = window.location
  return {
    eventId: uuid(),
    occurredAt: new Date().toISOString(),
    sessionId: state.sessionId,
    visitorId: state.visitorId,
    type,
    name: name ?? null,
    url: loc.href,
    path: loc.pathname,
    referrer: document.referrer || null,
    utmSource: state.lastUtm.utmSource ?? null,
    utmMedium: state.lastUtm.utmMedium ?? null,
    utmCampaign: state.lastUtm.utmCampaign ?? null,
    utmContent: state.lastUtm.utmContent ?? null,
    utmTerm: state.lastUtm.utmTerm ?? null,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    language: navigator.language ?? null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    properties: properties ?? null,
  }
}

function scheduleFlush() {
  if (!state || state.flushTimer) return
  state.flushTimer = setTimeout(() => {
    state!.flushTimer = null
    void flush()
  }, state.cfg.flushIntervalMs)
}

function debug(...args: unknown[]) {
  if (state?.cfg.debug) console.debug('[analytics]', ...args)
}

export async function flush(useBeacon = false): Promise<void> {
  if (!isBrowser() || !state || state.buffer.length === 0) return
  const batch = state.buffer.splice(0, state.buffer.length)
  const body = JSON.stringify({ events: batch })
  debug('flush', batch.length, useBeacon ? '(beacon)' : '(fetch)')

  if (useBeacon && 'sendBeacon' in navigator) {
    try {
      const blob = new Blob([body], { type: 'application/json' })
      const ok = navigator.sendBeacon(state.cfg.beaconEndpoint, blob)
      if (ok) return
    } catch {
      /* fallthrough to fetch */
    }
  }

  try {
    await fetch(state.cfg.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      credentials: 'omit',
      keepalive: true,
    })
  } catch (err) {
    debug('flush failed — re-buffering', err)
    // Re-injeta no buffer (sem ultrapassar maxBatchSize do próximo flush)
    state.buffer.unshift(...batch.slice(0, state.cfg.maxBatchSize * 2))
  }
}

function enqueue(ev: CollectEvent | null) {
  if (!ev || !state) return
  state.buffer.push(ev)
  if (state.buffer.length >= state.cfg.maxBatchSize) {
    void flush()
  } else {
    scheduleFlush()
  }
}

export function track(type: string, name?: string | null, properties?: Record<string, unknown> | null): void {
  enqueue(buildEvent(type, name, properties))
}

export function pageview(properties?: Record<string, unknown>): void {
  if (!state) return
  // pageview também reseta scroll depths e time-on-page baseline
  state.scrollDepths.clear()
  state.pageStartTs = Date.now()
  state.lastEngagementSeconds = 0
  state.lastPath = isBrowser() ? window.location.pathname : null
  enqueue(buildEvent('pageview', null, properties))
}

export function identify(properties: { leadId?: string } & Record<string, unknown>): void {
  enqueue(buildEvent('identify', null, properties))
  void flush(true)
}

function trackClicks(ev: MouseEvent) {
  if (!hasAnalyticsConsent()) return
  const target = ev.target as Element | null
  if (!target) return
  const trackedEl = target.closest<HTMLElement>('[data-track]')
  if (!trackedEl) return
  const name = trackedEl.dataset.track
  if (!name) return
  // Coleta todos data-track-* extras
  const props: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(trackedEl.dataset)) {
    if (k.startsWith('track') && k !== 'track' && v !== undefined) {
      // 'trackLocation' → 'location'
      const key = k.replace(/^track/, '')
      props[key.charAt(0).toLowerCase() + key.slice(1)] = v
    }
  }
  // Tag elemento
  const tag = trackedEl.tagName.toLowerCase()
  props.tag = tag
  if (tag === 'a') {
    const href = (trackedEl as HTMLAnchorElement).href
    if (href) props.href = href
  }
  track('click', name, props)
}

function trackOutbound(ev: MouseEvent) {
  const target = ev.target as Element | null
  const a = target?.closest('a')
  if (!a || !a.href) return
  if (a.hasAttribute('data-track')) return // já tagueado
  try {
    const url = new URL(a.href)
    if (url.host && url.host !== window.location.host) {
      track('outbound', null, { href: a.href, host: url.host })
    }
  } catch {
    /* ignore */
  }
}

function trackScroll() {
  if (!state) return
  if (!hasAnalyticsConsent()) return
  const doc = document.documentElement
  const scrollTop = window.scrollY ?? doc.scrollTop
  const viewport = window.innerHeight
  const full = doc.scrollHeight - viewport
  if (full <= 0) return
  const pct = Math.min(100, Math.round((scrollTop / full) * 100))
  for (const milestone of [25, 50, 75, 100]) {
    if (pct >= milestone && !state.scrollDepths.has(milestone)) {
      state.scrollDepths.add(milestone)
      track('scroll', 'depth', { depth: milestone })
    }
  }
}

function tickTimeOnPage() {
  if (!state || !state.hasFocus) return
  if (!hasAnalyticsConsent()) return
  const elapsed = Math.floor((Date.now() - state.pageStartTs) / 1000)
  // Reporta a cada 15s (15, 30, 60, 120, 300)
  const milestones = [15, 30, 60, 120, 300]
  for (const m of milestones) {
    if (elapsed >= m && state.lastEngagementSeconds < m) {
      track('engagement', 'time_on_page', { seconds: m })
      state.lastEngagementSeconds = m
    }
  }
}

function trackFormStart(ev: FocusEvent) {
  if (!hasAnalyticsConsent()) return
  const target = ev.target as Element | null
  const form = target?.closest('form')
  if (!form) return
  const name = form.dataset.trackForm ?? form.getAttribute('name') ?? form.id ?? 'unknown'
  // marca para não disparar duas vezes
  if (form.dataset.formStarted === '1') return
  form.dataset.formStarted = '1'
  track('form_start', name)
}

function trackFormSubmit(ev: SubmitEvent) {
  const form = ev.target as HTMLFormElement | null
  if (!form) return
  const name = form.dataset.trackForm ?? form.getAttribute('name') ?? form.id ?? 'unknown'
  track('form_submit', name)
}

function detectSpaPageviews() {
  if (!state) return
  const orig = history.pushState
  history.pushState = function (...args) {
    const r = orig.apply(this, args as Parameters<typeof history.pushState>)
    queueMicrotask(() => {
      if (state && state.lastPath !== window.location.pathname) pageview()
    })
    return r
  }
  window.addEventListener('popstate', () => {
    if (state && state.lastPath !== window.location.pathname) pageview()
  })
}

export function initAnalytics(config: AnalyticsConfig = {}): void {
  if (!isBrowser()) return
  if (state) return // idempotente

  const merged = {
    ...DEFAULT_CONFIG,
    ...config,
    autoTrack: { ...DEFAULT_CONFIG.autoTrack, ...(config.autoTrack ?? {}) },
  }

  const respectConsent = config.respectConsent ?? true
  const consent = respectConsent ? readConsent() : { analytics: true, functional: true, marketing: true }

  // Quando o usuário NÃO consentiu com analytics, NÃO persiste UID em
  // localStorage — gera UID volátil por aba (sessionStorage).
  const visitorId = consent?.analytics
    ? getOrCreate(localStorage, LS_VISITOR, () => uuid())
    : getOrCreate(sessionStorage, LS_VISITOR, () => uuid())

  state = {
    cfg: merged,
    sessionId: getOrCreate(sessionStorage, SS_SESSION, () => uuid()),
    visitorId,
    buffer: [],
    flushTimer: null,
    lastUtm: {},
    scrollDepths: new Set(),
    lastPath: null,
    pageStartTs: Date.now(),
    timeOnPageTimer: null,
    lastEngagementSeconds: 0,
    hasFocus: typeof document !== 'undefined' ? !document.hidden : true,
    consent,
    respectConsent,
  }

  // Atualiza o consentimento em tempo real quando o banner emite o evento global.
  window.addEventListener('aumaf:consent', (ev: Event) => {
    if (!state) return
    const detail = (ev as CustomEvent).detail as { analytics?: boolean; functional?: boolean; marketing?: boolean } | undefined
    if (!detail) return
    state.consent = {
      analytics: !!detail.analytics,
      functional: !!detail.functional,
      marketing: !!detail.marketing,
    }
    // Se o usuário passou a consentir analytics e o UID estava em sessionStorage,
    // promove para localStorage para manter persistência entre abas.
    if (state.consent.analytics) {
      try {
        if (!localStorage.getItem(LS_VISITOR)) localStorage.setItem(LS_VISITOR, state.visitorId)
      } catch {
        /* ignore */
      }
    }
    debug('consent updated', state.consent)
  })

  try {
    state.lastUtm = parseUtm(new URL(window.location.href))
  } catch {
    /* ignore */
  }

  if (merged.autoTrack.pageviews) {
    pageview()
    detectSpaPageviews()
  }
  if (merged.autoTrack.clicks) {
    document.addEventListener('click', trackClicks, true)
  }
  if (merged.autoTrack.outbound) {
    document.addEventListener('click', trackOutbound, true)
  }
  if (merged.autoTrack.scroll) {
    let ticking = false
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return
        ticking = true
        requestAnimationFrame(() => {
          trackScroll()
          ticking = false
        })
      },
      { passive: true },
    )
  }
  if (merged.autoTrack.timeOnPage) {
    state.timeOnPageTimer = setInterval(tickTimeOnPage, 5000)
  }
  if (merged.autoTrack.forms) {
    document.addEventListener('focusin', (e) => trackFormStart(e as FocusEvent), true)
    document.addEventListener('submit', (e) => trackFormSubmit(e as SubmitEvent), true)
  }

  // Visibilidade afeta engagement
  document.addEventListener('visibilitychange', () => {
    if (!state) return
    state.hasFocus = !document.hidden
    if (document.hidden) {
      // Quando aba some, dá um flush via beacon
      void flush(true)
    }
  })

  // Antes do unload, descarrega via beacon
  window.addEventListener('pagehide', () => void flush(true))
  window.addEventListener('beforeunload', () => void flush(true))

  debug('initialized', { sessionId: state.sessionId, visitorId: state.visitorId })
}

/** Reset — útil para testes ou logout */
export function resetAnalytics(): void {
  state = null
}
