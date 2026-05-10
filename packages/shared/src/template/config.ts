/**
 * ============================================================
 *  TEMPLATE CONFIG — Single Source of Truth da Marca
 * ============================================================
 *
 * Este arquivo é o ponto único de configuração de identidade do
 * template. Editando aqui, você re-skin o site público, o admin
 * e o backend ao mesmo tempo.
 *
 * Para inicializar uma nova marca interativamente:
 *   $ npm run brand:init
 *
 * Para trocar o tema visual, edite `theme.themeName` apontando
 * para um arquivo em `frontend-public/src/styles/themes/<name>.css`.
 *
 * Veja `docs/template/REBRAND.md` para o passo-a-passo completo.
 * ============================================================
 */

import type { TemplateConfig } from './types'

export const templateConfig: TemplateConfig = {
  // ---------- Identidade ----------
  name: 'AUMAF 3D',
  legalName: 'AUMAF 3D — Manufatura Aditiva',
  slug: 'aumaf-3d',
  url: 'https://aumaf.kayoridolfi.ai',
  logo: '/logo.png',
  founded: '2022',
  description:
    'Manufatura aditiva industrial de alta precisão. Peças em metal, carbono e polímeros com tolerância ±0.05mm. São Carlos – SP.',
  shortPitch:
    'Impressão 3D industrial em São Carlos, SP — peças com tolerância ±0.05mm.',

  industries: [
    'Automotiva',
    'Aeroespacial',
    'Médica',
    'Industrial',
    'Educação e Pesquisa',
  ],
  serviceAreaCountry: 'BR',

  // ---------- NAP ----------
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
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    displayPt: 'Segunda – Sexta, 08h–18h',
  },
  socials: {
    instagram: 'https://www.instagram.com/aumaf3d',
    linkedin: 'https://www.linkedin.com/company/aumaf3d',
    facebook: 'https://www.facebook.com/aumaf3d/',
  },

  // ---------- Navegação ----------
  navigation: {
    primary: [
      { label: 'Início', href: '/' },
      { label: 'Serviços', href: '/servicos' },
      { label: 'Materiais', href: '/materiais' },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'Sobre', href: '/sobre' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contato', href: '/contato' },
    ],
    footer: [
      {
        heading: 'Soluções',
        items: [
          { label: 'Serviços', href: '/servicos' },
          { label: 'Materiais', href: '/materiais' },
          { label: 'Portfolio', href: '/portfolio' },
        ],
      },
      {
        heading: 'Empresa',
        items: [
          { label: 'Sobre', href: '/sobre' },
          { label: 'Avaliações', href: '/avaliacoes' },
          { label: 'FAQ', href: '/faq' },
          { label: 'Blog', href: '/blog' },
        ],
      },
      {
        heading: 'Contato',
        items: [
          { label: 'Fale conosco', href: '/contato' },
        ],
      },
    ],
  },

  // ---------- Home ----------
  home: {
    hero: {
      eyebrow: 'Manufatura aditiva industrial',
      title: 'Impressão 3D Industrial',
      subtitle:
        'Peças em metal, carbono e polímeros com tolerância ±0.05mm. +500 projetos entregues.',
      primaryCta: { label: 'Solicitar orçamento', href: '/contato', variant: 'primary' },
      secondaryCta: { label: 'Ver portfolio', href: '/portfolio', variant: 'secondary' },
    },
    valueProps: [
      {
        title: 'Precisão industrial',
        description: 'Tolerância de ±0.05mm em peças funcionais e protótipos críticos.',
      },
      {
        title: 'Materiais técnicos',
        description: 'Metal 316L, PEEK, PA, PET-G CF15, resinas técnicas e polímeros de alto desempenho.',
      },
      {
        title: 'Engenharia consultiva',
        description: 'Apoio em DfAM, engenharia reversa e otimização topológica.',
      },
      {
        title: 'Orçamento em 24h',
        description: 'Receba sua cotação detalhada em até um dia útil.',
      },
    ],
  },

  // ---------- SEO ----------
  seo: {
    defaultTitle: 'AUMAF 3D — Impressão 3D Industrial em São Carlos',
    titleTemplate: '%s | AUMAF 3D',
    defaultDescription:
      'AUMAF 3D — manufatura aditiva industrial em São Carlos, SP. Impressão 3D em metal 316L, polímeros (PEEK, PA, PET-G CF15) e resina, com tolerância ±0.05mm.',
    defaultOgImage: '/og/og-default.png',
    locale: 'pt-BR',
  },

  // ---------- Tema ----------
  theme: {
    themeName: 'industrial-green',
    fontFamily: {
      sans: '"Space Grotesk", sans-serif',
      display: '"Space Grotesk", sans-serif',
    },
  },

  // ---------- Features ----------
  features: {
    blog: true,
    portfolio: true,
    reviews: true,
    contactForm: true,
    aiBlogGenerator: true,
    botyo: true,
  },
}

export default templateConfig
