import type { Config } from 'tailwindcss'
import tailwindAnimate from 'tailwindcss-animate'

/**
 * Tailwind do frontend-admin — todas as cores leem de CSS variables
 * compartilhadas com o frontend-public (mesmo design system).
 * Definidas em `src/index.css` via @import dos themes do public.
 */
const withRgb = (varName: string) => `rgb(var(${varName}) / <alpha-value>)`

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: withRgb('--color-background'),
        surface: {
          DEFAULT: withRgb('--color-surface'),
          dim: withRgb('--color-surface-dim'),
          low: withRgb('--color-surface-low'),
          base: withRgb('--color-surface-base'),
          high: withRgb('--color-surface-high'),
          highest: withRgb('--color-surface-highest'),
          variant: withRgb('--color-surface-variant'),
        },
        primary: {
          DEFAULT: withRgb('--color-primary'),
          container: withRgb('--color-primary-container'),
          dim: withRgb('--color-primary-dim'),
          fixed: withRgb('--color-primary-fixed'),
        },
        'on-surface': withRgb('--color-on-surface'),
        'on-surface-variant': withRgb('--color-on-surface-variant'),
        'on-primary': withRgb('--color-on-primary'),
        tertiary: withRgb('--color-tertiary'),
        'tertiary-container': withRgb('--color-tertiary-container'),
        outline: withRgb('--color-outline'),
        'outline-variant': withRgb('--color-outline-variant'),
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          DEFAULT: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.18)',
        },
        text: {
          primary: '#ffffff',
          secondary: withRgb('--color-on-surface'),
          tertiary: withRgb('--color-on-surface-variant'),
          muted: withRgb('--color-outline'),
        },
        danger: {
          400: withRgb('--color-error'),
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
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        // `pirulen` é uma fonte específica do legado AUMAF — preservada para
        // compatibilidade. Em uma nova marca, redefina a face em src/index.css.
        pirulen: ['Pirulen', 'var(--font-display)', 'sans-serif'],
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
        DEFAULT: 'var(--radius-default)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: '9999px',
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
        'glow-lg': 'var(--shadow-glow-lg)',
        'glow-sm': 'var(--shadow-glow-sm)',
        glass: 'var(--shadow-glass)',
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
        'grid-pattern': 'var(--gradient-grid)',
        'radial-brand': 'var(--gradient-radial-brand)',
        'radial-green': 'var(--gradient-radial-brand)',
      },
      backgroundSize: {
        grid: '60px 60px',
      },
    },
  },
  safelist: [
    'glass-panel', 'glass-panel-strong',
    'pill', 'pill-green',
    'grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3',
    'sm:grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-2',
    'gap-3', 'gap-4', 'gap-6', 'space-y-3', 'space-y-4',
    'flex', 'flex-col', 'flex-shrink-0', 'items-start', 'items-center', 'justify-center',
    'relative', 'absolute', 'overflow-hidden', 'overflow-x-auto',
    'inset-0', 'top-0', 'left-0', 'bottom-4', 'right-4',
    'text-body-lg', 'text-body-md', 'text-label-caps', 'text-code-data', 'text-headline-md',
    'text-on-surface', 'text-on-surface-variant', 'text-tertiary',
    'text-primary-container', 'text-white',
    'uppercase', 'tracking-widest', 'tracking-\\[0\\.2em\\]', 'tracking-\\[0\\.15em\\]',
    'leading-relaxed', 'leading-snug', 'leading-none',
    'font-bold', 'font-medium', 'font-light', 'italic', 'not-italic',
    'text-\\[10px\\]', 'text-\\[11px\\]', 'text-\\[12px\\]', 'text-sm',
    'border-b', 'border-l-2', 'border-t',
    'rounded-sm', 'rounded-full',
    'p-3', 'p-4', 'p-5', 'p-6', 'pb-3', 'pt-4', 'px-4', 'py-3', 'my-4', 'my-6', 'my-8',
    'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mt-2',
    'w-full', 'h-px', 'w-8', 'h-8',
    { pattern: /^(bg|border|text)-(primary|primary-container|on-surface|on-surface-variant|tertiary|white)\/(5|8|10|12|15|20|25|30|40|50|60|70|80)$/ },
    { pattern: /^(bg|border)-primary-container\/(10|15|20|40|50|60)$/ },
    { pattern: /^gap-\d+$/ },
    { pattern: /^(p|px|py|pb|pt|m|my|mb|mt)-\d+$/ },
    { pattern: /^(w|h)-\d+$/ },
    { pattern: /^grid-cols-\d+$/ },
    { pattern: /^sm:grid-cols-\d+$/ },
    { pattern: /^bg-gradient-to-r$/ },
    { pattern: /^from-(transparent|primary-container\/40)$/ },
    { pattern: /^via-(primary-container\/40)$/ },
    { pattern: /^to-(transparent)$/ },
  ],
  plugins: [tailwindAnimate],
}

export default config
