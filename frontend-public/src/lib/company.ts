/**
 * Single source of truth para NAP (Name/Address/Phone) e dados institucionais
 * da AUMAF 3D. Toda menção do front-public deve derivar daqui — garante
 * consistência para SEO local e GEO (LLMs).
 */
export const COMPANY = {
  name: 'AUMAF 3D',
  legalName: 'AUMAF 3D — Manufatura Aditiva',
  // Domínio canônico atual (homologação). Pós-migração: trocar para https://aumaf3d.com.br
  // e também alterar `site` em frontend-public/astro.config.ts.
  url: 'https://aumaf.kayoridolfi.ai',
  logo: 'https://aumaf.kayoridolfi.ai/logo.png',
  ogImageDefault: '/og/og-default.png',
  founded: '2022',
  description:
    'Manufatura aditiva industrial de alta precisão. Peças em metal, carbono e polímeros com tolerância ±0.05mm. São Carlos – SP.',
  shortPitch: 'Impressão 3D industrial em São Carlos, SP — peças com tolerância ±0.05mm.',
  address: {
    streetAddress: 'Alameda Sinlioku Tanaka, 202',
    neighborhood: 'Parque Tecnológico Damha II',
    addressLocality: 'São Carlos',
    addressRegion: 'SP',
    postalCode: '13565-261',
    addressCountry: 'BR',
  },
  geo: { latitude: -21.9766, longitude: -47.9064 },
  contact: {
    phone: '+5516992863412',
    phoneDisplay: '(16) 99286-3412',
    whatsapp: 'https://wa.me/5516992863412',
    email: 'comercial@aumaf3d.com.br',
  },
  hours: {
    open: '08:00',
    close: '18:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const,
    displayPt: 'Segunda – Sexta, 08h–18h',
  },
  socials: {
    instagram: 'https://www.instagram.com/aumaf3d',
    linkedin: 'https://www.linkedin.com/company/aumaf3d',
    facebook: 'https://www.facebook.com/aumaf3d/',
  },
  serviceAreaCountry: 'BR',
  industries: [
    'Automotiva',
    'Aeroespacial',
    'Médica',
    'Industrial',
    'Educação e Pesquisa',
  ],
} as const

export type Company = typeof COMPANY
