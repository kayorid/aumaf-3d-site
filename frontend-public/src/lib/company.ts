/**
 * COMPANY — Proxy do `templateConfig` no formato esperado pelos componentes
 * legados deste workspace. A fonte de verdade vive em
 * `packages/shared/src/template/config.ts`, acessível via:
 *
 *   import { templateConfig } from '@template/shared'
 *
 * Mantemos esse alias para evitar churn nos componentes existentes.
 * Em código novo, prefira importar `templateConfig` direto.
 */
import { templateConfig } from '@template/shared'

export const COMPANY = {
  name: templateConfig.name,
  legalName: templateConfig.legalName,
  url: templateConfig.url,
  logo: templateConfig.logo.startsWith('http')
    ? templateConfig.logo
    : `${templateConfig.url}${templateConfig.logo}`,
  ogImageDefault: templateConfig.seo.defaultOgImage,
  founded: templateConfig.founded ?? '',
  description: templateConfig.description,
  shortPitch: templateConfig.shortPitch,
  address: {
    streetAddress: templateConfig.address.streetAddress,
    neighborhood: templateConfig.address.neighborhood ?? '',
    addressLocality: templateConfig.address.addressLocality,
    addressRegion: templateConfig.address.addressRegion,
    postalCode: templateConfig.address.postalCode,
    addressCountry: templateConfig.address.addressCountry,
  },
  geo: templateConfig.geo ?? { latitude: 0, longitude: 0 },
  contact: templateConfig.contact,
  hours: templateConfig.hours ?? {
    open: '09:00',
    close: '18:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const,
    displayPt: 'Segunda – Sexta',
  },
  socials: {
    instagram: templateConfig.socials.instagram ?? '',
    linkedin: templateConfig.socials.linkedin ?? '',
    facebook: templateConfig.socials.facebook ?? '',
  },
  serviceAreaCountry: templateConfig.serviceAreaCountry ?? 'BR',
  industries: templateConfig.industries ?? [],
} as const

export type Company = typeof COMPANY
