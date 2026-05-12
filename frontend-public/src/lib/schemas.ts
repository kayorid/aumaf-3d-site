import { COMPANY } from './company'

const ORG_ID = `${COMPANY.url}/#org`
const LOCAL_ID = `${COMPANY.url}/#local`
const SITE_ID = `${COMPANY.url}/#site`

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    url: COMPANY.url,
    logo: {
      '@type': 'ImageObject',
      '@id': `${COMPANY.url}/#logo`,
      url: COMPANY.logo,
      width: 512,
      height: 512,
      caption: COMPANY.name,
    },
    image: { '@id': `${COMPANY.url}/#logo` },
    foundingDate: COMPANY.founded,
    description: COMPANY.description,
    knowsAbout: [
      'Impressão 3D',
      'Manufatura aditiva',
      'Prototipagem rápida',
      'FDM',
      'SLA',
      'SLS',
      'SLM',
      'Sinterização de metal',
      'Engenharia reversa',
      'Aço Inox 316L',
      'PA12',
      'PA CF15',
      'DfAM',
    ],
    sameAs: [
      COMPANY.socials.instagram,
      COMPANY.socials.linkedin,
      COMPANY.socials.facebook,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: COMPANY.contact.phone,
      email: COMPANY.contact.email,
      areaServed: COMPANY.serviceAreaCountry,
      availableLanguage: ['pt-BR'],
    },
  }
}

export function localBusinessSchema() {
  return {
    '@type': 'LocalBusiness',
    '@id': LOCAL_ID,
    name: COMPANY.name,
    image: COMPANY.logo,
    url: COMPANY.url,
    telephone: COMPANY.contact.phone,
    email: COMPANY.contact.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${COMPANY.address.streetAddress} — ${COMPANY.address.neighborhood}`,
      addressLocality: COMPANY.address.addressLocality,
      addressRegion: COMPANY.address.addressRegion,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY.geo.latitude,
      longitude: COMPANY.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...COMPANY.hours.days],
        opens: COMPANY.hours.open,
        closes: COMPANY.hours.close,
      },
    ],
    areaServed: { '@type': 'Country', name: 'Brasil' },
    parentOrganization: { '@id': ORG_ID },
  }
}

export function webSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: COMPANY.url,
    name: COMPANY.name,
    inLanguage: 'pt-BR',
    publisher: { '@id': ORG_ID },
  }
}

export function webPageSchema(args: {
  url: string
  name: string
  description: string
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'FAQPage'
}) {
  return {
    '@type': args.type ?? 'WebPage',
    '@id': `${args.url}#page`,
    url: args.url,
    name: args.name,
    description: args.description,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': SITE_ID },
    publisher: { '@id': ORG_ID },
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function faqPageSchema(faqs: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export function howToSchema(args: {
  name: string
  description: string
  steps: { name: string; text: string; image?: string }[]
}) {
  return {
    '@type': 'HowTo',
    name: args.name,
    description: args.description,
    step: args.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.image ? { image: s.image } : {}),
    })),
  }
}

export function serviceSchema(args: {
  name: string
  description: string
  url?: string
  category?: string
  serviceType?: string
}) {
  return {
    '@type': 'Service',
    name: args.name,
    description: args.description,
    serviceType: args.serviceType ?? args.name,
    category: args.category ?? 'Manufacturing',
    provider: { '@id': LOCAL_ID },
    areaServed: { '@type': 'Country', name: 'Brasil' },
    ...(args.url ? { url: args.url } : {}),
  }
}

export function blogPostingSchema(args: {
  url: string
  headline: string
  description: string
  image: string
  imageWidth?: number
  imageHeight?: number
  datePublished: string
  dateModified?: string
  authorName?: string
  section?: string
  wordCount?: number
  keywords?: string[]
}) {
  const isOrg = !args.authorName || args.authorName === 'Equipe AUMAF 3D'
  return {
    '@type': 'BlogPosting',
    '@id': `${args.url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${args.url}#page` },
    headline: args.headline,
    description: args.description,
    image: {
      '@type': 'ImageObject',
      url: args.image,
      width: args.imageWidth ?? 1200,
      height: args.imageHeight ?? 630,
    },
    inLanguage: 'pt-BR',
    datePublished: args.datePublished,
    dateModified: args.dateModified ?? args.datePublished,
    ...(args.section ? { articleSection: args.section } : {}),
    ...(args.wordCount ? { wordCount: args.wordCount } : {}),
    ...(args.keywords ? { keywords: args.keywords.join(', ') } : {}),
    author: isOrg
      ? { '@id': ORG_ID, '@type': 'Organization', name: 'Equipe AUMAF 3D' }
      : { '@type': 'Person', name: args.authorName },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': SITE_ID },
  }
}

export function itemListSchema(items: { name: string; url?: string; description?: string }[]) {
  return {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.url ? { url: it.url } : {}),
      ...(it.description ? { description: it.description } : {}),
    })),
  }
}

/** Wrap multiple schemas in a single @graph payload. */
export function graphPayload(nodes: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  }
}
