/**
 * Bootstrap do SDK de analytics no frontend público.
 * Importado pelo Base.astro via <script>. Hidratação client-only — não roda em SSR.
 *
 * Endpoint apontado para a mesma origem em prod (proxy/Caddy expõe /api/v1/analytics)
 * e localhost:3000 em dev (via PUBLIC_ANALYTICS_ENDPOINT).
 */
import { initAnalytics, track } from '@aumaf/analytics-sdk'

const endpoint =
  (import.meta.env.PUBLIC_ANALYTICS_ENDPOINT as string | undefined) ?? '/api/v1/analytics/collect'
const beaconEndpoint = endpoint.replace(/\/collect$/, '/collect/beacon')

initAnalytics({
  endpoint,
  beaconEndpoint,
  debug: import.meta.env.DEV,
  // LGPD — respeita o consentimento do banner (chave `aumaf_consent_v1`).
  // Quando `analytics:false`, pageviews continuam (legítimo interesse +
  // IP hasheado server-side) mas não persiste UID em localStorage nem
  // captura clicks/scroll/forms/time-on-page.
  respectConsent: true,
})

// Web Vitals — chunk separado, dispara cada métrica no momento final
// (LCP no idle, CLS no pagehide, INP em interação etc.). Reportado como
// evento `custom` com name=`web_vital` para o pipeline próprio.
import('web-vitals')
  .then(({ onCLS, onLCP, onINP, onFCP, onTTFB }) => {
    const report = (metric: {
      name: string
      value: number
      rating: string
      id: string
      navigationType?: string
    }) => {
      track('custom', 'web_vital', {
        metric: metric.name,
        value: Math.round(metric.value * 1000) / 1000,
        rating: metric.rating,
        metricId: metric.id,
        navigationType: metric.navigationType ?? null,
        path: window.location.pathname,
      })
    }
    onCLS(report)
    onLCP(report)
    onINP(report)
    onFCP(report)
    onTTFB(report)
  })
  .catch(() => {
    // Silencioso: web-vitals falhou ao carregar; métricas perdidas para esta sessão.
  })
