import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
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
