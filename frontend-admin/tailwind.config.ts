import type { Config } from 'tailwindcss'
import tailwindAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
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
          // aliases mantendo compatibilidade com componentes existentes
          50: '#0e0e0e',
          100: '#131313',
          200: '#1c1b1b',
          300: '#2a2a2a',
          400: '#353534',
        },
        primary: {
          DEFAULT: '#7ce268',
          container: '#61c54f',
          dim: '#78dd64',
          fixed: '#93fa7d',
          // aliases para componentes existentes
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#7ce268',
          500: '#61c54f',
          600: '#4fb83a',
          700: '#3a8c2c',
          800: '#2f6b25',
          900: '#013a00',
        },
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#becab6',
        'on-primary': '#013a00',
        tertiary: '#cdcaca',
        'tertiary-container': '#b1afaf',
        outline: '#899482',
        'outline-variant': '#3f4a3b',
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          DEFAULT: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.18)',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e5e2e1',
          tertiary: '#becab6',
          muted: '#899482',
        },
        danger: {
          400: '#ffb4ab',
          500: '#f87171',
          600: '#dc2626',
        },
        warn: {
          400: '#facc15',
          500: '#eab308',
        },
        info: {
          400: '#60a5fa',
          500: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        pirulen: ['Pirulen', '"Space Grotesk"', 'sans-serif'],
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
      borderRadius: {
        DEFAULT: '2px',
        sm: '1px',
        md: '4px',
        lg: '8px',
        full: '9999px',
      },
      boxShadow: {
        glow: '0 0 15px rgba(97, 197, 79, 0.35)',
        'glow-lg': '0 0 30px rgba(97, 197, 79, 0.4), 0 0 60px rgba(97, 197, 79, 0.15)',
        'glow-sm': '0 0 8px rgba(97, 197, 79, 0.2)',
        glass: '0 8px 32px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 200ms ease-out',
        'fade-up': 'fade-up 0.7s ease forwards',
        'pulse-dot': 'pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scan-line 4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(124,226,104,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,226,104,0.04) 1px, transparent 1px)',
        'radial-green': 'radial-gradient(ellipse at 30% 50%, rgba(97,197,79,0.07) 0%, transparent 70%)',
      },
      backgroundSize: {
        grid: '60px 60px',
      },
    },
  },
  plugins: [tailwindAnimate],
}

export default config
