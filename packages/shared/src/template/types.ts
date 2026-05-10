/**
 * Tipos do template.config.ts — single source of truth de identidade da marca.
 *
 * Editado pelo proprietário de cada brand via `template.config.ts` na raiz
 * do projeto, ou via `npm run brand:init`.
 */

export interface TemplateAddress {
  streetAddress: string
  neighborhood?: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  addressCountry: string
}

export interface TemplateGeo {
  latitude: number
  longitude: number
}

export interface TemplateContact {
  phone: string
  phoneDisplay: string
  whatsapp: string
  email: string
}

export interface TemplateHours {
  open: string
  close: string
  days: ReadonlyArray<
    | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  >
  displayPt: string
}

export interface TemplateSocials {
  instagram?: string
  linkedin?: string
  facebook?: string
  twitter?: string
  youtube?: string
  tiktok?: string
  github?: string
}

export interface TemplateNavItem {
  label: string
  href: string
  external?: boolean
}

export interface TemplateNavigation {
  primary: ReadonlyArray<TemplateNavItem>
  footer: ReadonlyArray<{ heading: string; items: ReadonlyArray<TemplateNavItem> }>
}

export interface TemplateCTA {
  label: string
  href: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export interface TemplateHero {
  eyebrow?: string
  title: string
  subtitle: string
  primaryCta: TemplateCTA
  secondaryCta?: TemplateCTA
}

export interface TemplateValueProp {
  icon?: string
  title: string
  description: string
}

export interface TemplateHome {
  hero: TemplateHero
  valueProps: ReadonlyArray<TemplateValueProp>
}

export interface TemplateSEO {
  defaultTitle: string
  titleTemplate: string
  defaultDescription: string
  defaultOgImage: string
  twitterHandle?: string
  locale: string
}

export interface TemplateTheme {
  /**
   * Nome do arquivo dentro de `frontend-public/src/styles/themes/`.
   * Não inclua `.css`. Exemplos: `industrial-green`, `ocean-blue`, `warm-boutique`.
   */
  themeName: string
  /**
   * Família principal de fonte (sans/display) — deve estar carregada via @import
   * no `global.css` do frontend-public.
   */
  fontFamily: {
    sans: string
    display: string
    mono?: string
  }
}

export interface TemplateFeatures {
  /** Habilita seção de blog no site público. */
  blog: boolean
  /** Habilita seção de portfólio/cases. */
  portfolio: boolean
  /** Habilita seção de avaliações Google. */
  reviews: boolean
  /** Habilita formulário de contato com captação de leads. */
  contactForm: boolean
  /** Habilita gerador de posts via IA no admin. */
  aiBlogGenerator: boolean
  /** Habilita integração Botyo (WhatsApp chatbot). */
  botyo: boolean
}

export interface TemplateConfig {
  /** Identidade básica. */
  name: string
  legalName: string
  slug: string
  url: string
  logo: string
  founded?: string
  description: string
  shortPitch: string

  industries?: ReadonlyArray<string>
  serviceAreaCountry?: string

  address: TemplateAddress
  geo?: TemplateGeo
  contact: TemplateContact
  hours?: TemplateHours
  socials: TemplateSocials

  navigation: TemplateNavigation
  home: TemplateHome
  seo: TemplateSEO
  theme: TemplateTheme
  features: TemplateFeatures
}
