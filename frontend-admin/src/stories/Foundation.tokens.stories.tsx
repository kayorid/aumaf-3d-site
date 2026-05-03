import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Foundation/Tokens',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tokens vivos do Design System **Cinematic Additive Manufacturing**. Esta página renderiza diretamente as classes do Tailwind do projeto — qualquer mudança em `tailwind.config.ts` aparece aqui automaticamente.',
      },
    },
  },
}
export default meta

type Story = StoryObj

interface Swatch {
  name: string
  className: string
  hex?: string
  hint?: string
}

const SURFACES: Swatch[] = [
  { name: 'background', className: 'bg-background', hex: '#000000', hint: 'fundo absoluto' },
  { name: 'surface-dim', className: 'bg-surface-dim', hex: '#0e0e0e' },
  { name: 'surface', className: 'bg-surface', hex: '#131313' },
  { name: 'surface-low', className: 'bg-surface-low', hex: '#1c1b1b', hint: 'cards/painéis' },
  { name: 'surface-base', className: 'bg-surface-base', hex: '#201f1f' },
  { name: 'surface-high', className: 'bg-surface-high', hex: '#2a2a2a' },
  { name: 'surface-highest', className: 'bg-surface-highest', hex: '#353534' },
]

const PRIMARIES: Swatch[] = [
  { name: 'primary', className: 'bg-primary', hex: '#7ce268' },
  { name: 'primary-container', className: 'bg-primary-container', hex: '#61c54f', hint: 'CTA/links ativos' },
  { name: 'primary-dim', className: 'bg-primary-dim', hex: '#78dd64' },
  { name: 'primary-fixed', className: 'bg-primary-fixed', hex: '#93fa7d' },
]

const TEXTS: Swatch[] = [
  { name: 'text-primary', className: 'text-text-primary', hex: '#ffffff' },
  { name: 'text-secondary', className: 'text-text-secondary', hex: '#e5e2e1' },
  { name: 'text-tertiary', className: 'text-text-tertiary', hex: '#becab6' },
  { name: 'text-muted', className: 'text-text-muted', hex: '#899482' },
]

const STATUS: Swatch[] = [
  { name: 'danger-500', className: 'bg-danger-500', hex: '#f87171' },
  { name: 'warn-500', className: 'bg-warn-500', hex: '#eab308' },
  { name: 'info-500', className: 'bg-info-500', hex: '#3b82f6' },
  { name: 'primary-container', className: 'bg-primary-container', hex: '#61c54f' },
]

function ColorRow({ swatches, isText }: { swatches: Swatch[]; isText?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {swatches.map((s) => (
        <div key={s.name} className="border border-border bg-surface-dim p-3">
          {isText ? (
            <div className={`${s.className} mb-2 text-lg font-bold`}>Aa</div>
          ) : (
            <div className={`${s.className} mb-2 h-16 border border-border-subtle`} />
          )}
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">
            {s.name}
          </div>
          {s.hex && <div className="font-mono text-[10px] text-text-muted">{s.hex}</div>}
          {s.hint && <div className="mt-1 text-[10px] text-text-tertiary">{s.hint}</div>}
        </div>
      ))}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary-container">
        {title}
      </h2>
      {children}
    </section>
  )
}

export const Colors: Story = {
  render: () => (
    <div className="space-y-10">
      <Section title="Surfaces">
        <ColorRow swatches={SURFACES} />
      </Section>
      <Section title="Primary (verde Cinematic)">
        <ColorRow swatches={PRIMARIES} />
      </Section>
      <Section title="Text">
        <ColorRow swatches={TEXTS} isText />
      </Section>
      <Section title="Status">
        <ColorRow swatches={STATUS} />
      </Section>
    </div>
  ),
}

export const Typography: Story = {
  render: () => (
    <div className="space-y-8">
      <Section title="Display & Headlines">
        <div className="space-y-3">
          <div className="text-display-xl text-white">Display XL</div>
          <div className="text-display-lg text-white">Display LG</div>
          <div className="text-headline-lg text-white">Headline LG</div>
          <div className="text-headline-md text-white">Headline MD</div>
        </div>
      </Section>
      <Section title="Body">
        <div className="space-y-2 max-w-2xl">
          <p className="text-body-lg text-text-secondary">
            Body LG — usado em parágrafos principais de posts e descrições destacadas.
          </p>
          <p className="text-body-md text-text-tertiary">
            Body MD — texto corrido padrão. Aceita ênfases em <strong className="text-primary-container">primary-container</strong>.
          </p>
        </div>
      </Section>
      <Section title="Labels & Code">
        <div className="space-y-2">
          <div className="text-label-caps text-text-tertiary">Label caps · letter-spacing 0.2em</div>
          <div className="text-code-data text-primary-container">CODE-DATA · 0.05em · uppercase</div>
        </div>
      </Section>
      <Section title="Famílias">
        <div className="space-y-2">
          <div className="font-sans text-white">Space Grotesk — sans (default)</div>
          <div className="font-mono text-text-tertiary">JetBrains Mono — mono</div>
          <div className="font-pirulen text-primary-container">PIRULEN — só lockup AUMAF 3D</div>
        </div>
      </Section>
    </div>
  ),
}

export const Radii: Story = {
  render: () => (
    <Section title="Border Radius (cantos sharp por DS)">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { token: 'rounded-sm', label: '1px (canônico DS)' },
          { token: 'rounded', label: '2px (default)' },
          { token: 'rounded-md', label: '4px (subtle)' },
          { token: 'rounded-lg', label: '8px (cards grandes)' },
        ].map(({ token, label }) => (
          <div key={token} className="bg-surface-dim border border-border p-3">
            <div className={`${token} h-14 bg-primary-container/15 border border-primary-container/30`} />
            <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">
              {token}
            </div>
            <div className="text-[10px] text-text-muted">{label}</div>
          </div>
        ))}
      </div>
    </Section>
  ),
}

export const Shadows: Story = {
  render: () => (
    <Section title="Glow & Shadow">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[
          { c: 'shadow-glow-sm', label: 'glow-sm' },
          { c: 'shadow-glow', label: 'glow (CTA)' },
          { c: 'shadow-glow-lg', label: 'glow-lg (hero)' },
          { c: 'shadow-glass', label: 'glass (modal)' },
        ].map(({ c, label }) => (
          <div key={c} className={`${c} bg-surface-low border border-border p-6`}>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">
              {label}
            </div>
          </div>
        ))}
      </div>
    </Section>
  ),
}
