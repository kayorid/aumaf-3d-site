import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  // === Phase 2 — safelist para classes usadas em conteúdo dinâmico de posts ===
  // Os 6 posts migrados em P2 usam HTML inline com classes do design system
  // que precisam sobreviver ao purge do Tailwind (não estão em arquivos .astro
  // do source, e sim em strings vindas da API).
  safelist: [
    // Layout containers
    'glass-panel', 'pill', 'pill-active', 'pill-green',
    // Tipografia DS
    'text-display-xl', 'text-headline-lg', 'text-headline-md',
    'text-body-lg', 'text-body-md',
    'text-label-caps', 'text-code-data',
    // Cores DS — variantes usadas em conteúdo
    'text-primary-container', 'text-on-surface', 'text-on-surface-variant',
    'text-tertiary', 'text-white',
    'bg-primary-container', 'bg-surface-base',
    'border-primary-container', 'border-white/8', 'border-white/12', 'border-white/30',
    // Patterns: opacidades das cores DS (recorrentes em conteúdo)
    {
      pattern: /^(text|bg|border)-(primary-container|tertiary|on-surface|on-surface-variant|white)\/(5|8|10|12|15|20|25|30|40|50|60|70|80|90)$/,
    },
    // Patterns: layouts comuns nos cards/grids dos posts
    { pattern: /^(grid|grid-cols|sm:grid-cols|md:grid-cols|gap)-/ },
    { pattern: /^(p|m|px|py|pt|pb|pl|pr|mt|mb|mx|my|gap)-/ },
    { pattern: /^(w|h|max-w|min-h|aspect)-/ },
    { pattern: /^rounded-(sm|md|lg|xl|full|none)$/ },
    { pattern: /^(uppercase|tracking|leading|font|italic|not-italic|relative|absolute|inset|top|left|right|bottom|flex|inline-flex|items|justify|space|overflow)/ },
    'border-l-2',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: {
          DEFAULT: '#131313',
          dim: '#0e0e0e',
          low: '#1c1b1b',
          base: '#201f1f',
          high: '#2a2a2a',
          highest: '#353534',
          variant: '#353534',
        },
        primary: {
          DEFAULT: '#7ce268',
          container: '#61c54f',
          dim: '#78dd64',
          fixed: '#93fa7d',
        },
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#becab6',
        'on-primary': '#013a00',
        tertiary: '#cdcaca',
        'tertiary-container': '#b1afaf',
        outline: '#899482',
        'outline-variant': '#3f4a3b',
        error: '#ffb4ab',
        'error-container': '#93000a',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(48px,6vw,72px)', { lineHeight: '1.0', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(36px,5vw,56px)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'headline-lg': ['clamp(28px,3vw,40px)', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'headline-md': ['clamp(20px,2vw,24px)', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'body-lg': ['18px', { lineHeight: '1.6', letterSpacing: '0em' }],
        'body-md': ['16px', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'label-caps': ['11px', { lineHeight: '1.0', letterSpacing: '0.2em' }],
        'code-data': ['13px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      spacing: {
        margin: '64px',
        'margin-sm': '24px',
        gutter: '24px',
        'section-gap': '160px',
        'section-gap-sm': '80px',
        'stack-xl': '96px',
        'stack-lg': '48px',
        'stack-md': '24px',
        'stack-sm': '8px',
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '1px',
        md: '4px',
        lg: '8px',
        full: '9999px',
      },
      backdropBlur: {
        glass: '40px',
        nav: '48px',
      },
      boxShadow: {
        glow: '0 0 15px rgba(97, 197, 79, 0.3)',
        'glow-lg': '0 0 30px rgba(97, 197, 79, 0.4)',
        'glow-sm': '0 0 8px rgba(97, 197, 79, 0.2)',
        glass: '0 8px 32px rgba(0,0,0,0.6)',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up': 'fadeUp 0.7s ease forwards',
        'marquee': 'marquee 25s linear infinite',
        'scan-line': 'scanLine 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'drift': 'drift 8s ease-in-out infinite',
        'blink': 'blink 1.2s step-end infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '33%': { transform: 'translateY(-6px) translateX(4px)' },
          '66%': { transform: 'translateY(4px) translateX(-3px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        rotateSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(124,226,104,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,226,104,0.04) 1px, transparent 1px)',
        'radial-green': 'radial-gradient(ellipse at 30% 50%, rgba(97,197,79,0.07) 0%, transparent 70%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        grid: '60px 60px',
      },
    },
  },
  plugins: [],
}

export default config
