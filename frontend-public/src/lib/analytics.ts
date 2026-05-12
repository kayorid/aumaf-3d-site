/**
 * Bootstrap do SDK de analytics no frontend público.
 * Importado pelo Base.astro via <script>. Hidratação client-only — não roda em SSR.
 *
 * Endpoint apontado para a mesma origem em prod (proxy/Caddy expõe /api/v1/analytics)
 * e localhost:3000 em dev (via PUBLIC_ANALYTICS_ENDPOINT).
 */
import { initAnalytics } from '@aumaf/analytics-sdk'

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
