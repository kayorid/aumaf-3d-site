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
  // Safelist para classes usadas em blocos HTML do editor (HtmlBlock NodeView preview).
  // O purger não analisa strings dinâmicas de HTML — estas classes precisam ser
  // explicitamente preservadas para o preview do DS aparecer corretamente no editor.
  safelist: [
    // Layout dos blocos
    'glass-panel', 'glass-panel-strong',
    'pill', 'pill-green',
    // Grid e flex
    'grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3',
    'sm:grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-2',
    'gap-3', 'gap-4', 'gap-6', 'space-y-3', 'space-y-4',
    'flex', 'flex-col', 'flex-shrink-0', 'items-start', 'items-center', 'justify-center',
    'relative', 'absolute', 'overflow-hidden', 'overflow-x-auto',
    'inset-0', 'top-0', 'left-0', 'bottom-4', 'right-4',
    // Tipografia DS
    'text-body-lg', 'text-body-md', 'text-label-caps', 'text-code-data', 'text-headline-md',
    'text-on-surface', 'text-on-surface-variant', 'text-tertiary',
    'text-primary-container', 'text-white',
    'uppercase', 'tracking-widest', 'tracking-\\[0\\.2em\\]', 'tracking-\\[0\\.15em\\]',
    'leading-relaxed', 'leading-snug', 'leading-none',
    'font-bold', 'font-medium', 'font-light', 'italic', 'not-italic',
    'text-\\[10px\\]', 'text-\\[11px\\]', 'text-\\[12px\\]', 'text-sm',
    // Bordas e backgrounds DS
    'border-b', 'border-l-2', 'border-t',
    'rounded-sm', 'rounded-full',
    'p-3', 'p-4', 'p-5', 'p-6', 'pb-3', 'pt-4', 'px-4', 'py-3', 'my-4', 'my-6', 'my-8',
    'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mt-2',
    'w-full', 'h-px', 'w-8', 'h-8',
    // Padrões com opacidade (Tailwind JIT) — usar regex
    { pattern: /^(bg|border|text)-(primary-container|on-surface|on-surface-variant|tertiary|white)\/(5|8|10|12|15|20|25|30|40|50|60|70|80)$/ },
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
