/**
 * Componentes React de preview por tipo de bloco.
 *
 * Usam estilos INLINE que replicam o Design System Cinematic diretamente,
 * sem depender do Tailwind do admin conhecer as classes do público.
 * Isso garante fidelidade visual idêntica ao site real, independente de safelist.
 */
import { detectBlockLabel } from './HtmlBlockView'

/* ═══════════════════════════════════════════
   Tokens do DS — mapeados para CSS-in-JS
   ═══════════════════════════════════════════ */
const DS = {
  colors: {
    primaryContainer: '#61c54f',
    onSurface: '#e5e2e1',
    onSurfaceVariant: '#becab6',
    tertiary: '#cdcaca',
    white: '#ffffff',
    border: 'rgba(255,255,255,0.08)',
    border12: 'rgba(255,255,255,0.12)',
    borderPrimary15: 'rgba(97,197,79,0.15)',
    borderPrimary50: 'rgba(97,197,79,0.5)',
    bgPrimary10: 'rgba(97,197,79,0.10)',
    bgPrimary20: 'rgba(97,197,79,0.20)',
  },
  glass: {
    background: 'rgba(42,42,42,0.55)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: '2px',
    border: '1px solid rgba(255,255,255,0.08)',
  } as React.CSSProperties,
  text: {
    labelCaps: {
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.2em',
      textTransform: 'uppercase' as const,
      fontFamily: '"Space Grotesk", sans-serif',
    },
    bodyMd: {
      fontSize: '16px',
      lineHeight: 1.6,
      fontFamily: '"Space Grotesk", sans-serif',
    },
    bodyLg: {
      fontSize: '18px',
      lineHeight: 1.65,
      fontFamily: '"Space Grotesk", sans-serif',
    },
    codeTiny: {
      fontSize: '10px',
      fontFamily: '"Space Grotesk", sans-serif',
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
      fontWeight: 700,
    },
  },
}

/* ═══════════════════════════════════════════
   Linha de acento verde no topo (padrão DS)
   ═══════════════════════════════════════════ */
function AccentLine() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(97,197,79,0.4), transparent)',
    }} />
  )
}

/* ═══════════════════════════════════════════
   SPECS GRID
   ═══════════════════════════════════════════ */
interface SpecItem { label: string; value: string }

function SpecsGridPreview({ html }: { html: string }) {
  const { title, items } = parseSpecsData(html)
  return (
    <div style={{
      ...DS.glass,
      padding: '1.25rem 1.5rem',
      margin: '1rem 0',
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${DS.colors.borderPrimary15}`,
    }}>
      <AccentLine />
      <span style={{ ...DS.text.labelCaps, color: DS.colors.onSurfaceVariant, display: 'block', marginBottom: '1rem' }}>
        {title}
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {items.map((it, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${DS.colors.border}`, paddingBottom: '0.75rem' }}>
            <span style={{ ...DS.text.codeTiny, color: DS.colors.onSurfaceVariant, display: 'block', marginBottom: '2px', fontSize: '10px' }}>
              {it.label}
            </span>
            <span style={{ ...DS.text.bodyMd, color: DS.colors.onSurface, fontWeight: 500 }}>
              {it.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function parseSpecsData(html: string): { title: string; items: SpecItem[] } {
  if (typeof document === 'undefined') return { title: 'Dados do Projeto', items: [] }
  const w = document.createElement('div')
  w.innerHTML = html
  const titleEl = w.querySelector('span[class*="tracking"]')
  const title = titleEl?.textContent?.trim() ?? 'Dados do Projeto'
  const items: SpecItem[] = []
  const itemDivs = w.querySelectorAll('div[class*="pb-"]')
  itemDivs.forEach((div) => {
    const spans = div.querySelectorAll('span')
    if (spans.length >= 2) {
      const label = spans[0].textContent?.trim() ?? ''
      const value = spans[1].textContent?.trim() ?? ''
      if (label || value) items.push({ label, value })
    }
  })
  if (items.length === 0) {
    w.querySelectorAll('div[class*="border-b"]').forEach((div) => {
      const spans = div.querySelectorAll('span')
      if (spans.length >= 2) {
        const label = spans[0].textContent?.trim() ?? ''
        const value = spans[1].textContent?.trim() ?? ''
        if (label || value) items.push({ label, value })
      }
    })
  }
  return { title, items }
}

/* ═══════════════════════════════════════════
   QUOTE CARD
   ═══════════════════════════════════════════ */
function QuoteCardPreview({ html }: { html: string }) {
  if (typeof document === 'undefined') return null
  const w = document.createElement('div')
  w.innerHTML = html
  const pEl = w.querySelector('p')
  const citeEl = w.querySelector('cite')
  const text = (pEl?.textContent ?? '').trim()
  const author = (citeEl?.textContent ?? '').trim()
  return (
    <blockquote style={{
      ...DS.glass,
      borderLeft: `2px solid ${DS.colors.primaryContainer}`,
      padding: '1.5rem',
      margin: '1.5rem 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <AccentLine />
      <p style={{ ...DS.text.bodyLg, color: DS.colors.onSurface, fontStyle: 'italic', marginBottom: '0.75rem' }}>
        {text}
      </p>
      <footer>
        <cite style={{ ...DS.text.labelCaps, color: DS.colors.primaryContainer, fontStyle: 'normal' }}>
          {author}
        </cite>
      </footer>
    </blockquote>
  )
}

/* ═══════════════════════════════════════════
   COMPARISON TABLE
   ═══════════════════════════════════════════ */
function TablePreview({ html }: { html: string }) {
  if (typeof document === 'undefined') return null
  const w = document.createElement('div')
  w.innerHTML = html
  const headers = Array.from(w.querySelectorAll('thead th')).map(th => th.textContent?.trim() ?? '')
  const rows = Array.from(w.querySelectorAll('tbody tr')).map(tr =>
    Array.from(tr.querySelectorAll('td')).map(td => td.textContent?.trim() ?? '')
  )
  return (
    <div style={{
      ...DS.glass,
      overflow: 'hidden',
      margin: '1.5rem 0',
      border: `1px solid ${DS.colors.borderPrimary15}`,
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: DS.colors.bgPrimary10, borderBottom: `1px solid rgba(255,255,255,0.10)` }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                ...DS.text.labelCaps,
                color: DS.colors.primaryContainer,
                padding: '0.625rem 1rem',
                textAlign: 'left',
                fontSize: '10px',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: ri < rows.length - 1 ? `1px solid rgba(255,255,255,0.05)` : 'none' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '0.625rem 1rem',
                  color: ci === 0 ? DS.colors.onSurfaceVariant : DS.colors.onSurface,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ═══════════════════════════════════════════
   DECISION FLOW
   ═══════════════════════════════════════════ */
function DecisionFlowPreview({ html }: { html: string }) {
  if (typeof document === 'undefined') return null
  const w = document.createElement('div')
  w.innerHTML = html
  const rows = Array.from(w.querySelectorAll('div[class*="flex"][class*="gap-4"]'))
  const steps = rows.map((row) => {
    const qEl = row.querySelector('p[class*="font-medium"]') || row.querySelector('p')
    const pEls = row.querySelectorAll('p')
    const ansEl = pEls.length > 1 ? pEls[1] : null
    return {
      question: qEl?.textContent?.trim() ?? '',
      answer: ansEl?.textContent?.trim() ?? '',
    }
  })
  return (
    <div style={{
      ...DS.glass,
      padding: '1.5rem',
      margin: '1.5rem 0',
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${DS.colors.borderPrimary15}`,
    }}>
      <AccentLine />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <span style={{
              flexShrink: 0,
              width: '2rem', height: '2rem',
              borderRadius: '9999px',
              background: DS.colors.bgPrimary20,
              border: `1px solid ${DS.colors.borderPrimary50}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: DS.colors.primaryContainer,
              fontSize: '11px', fontWeight: 700,
            }}>{i + 1}</span>
            <div>
              <p style={{ ...DS.text.bodyMd, color: DS.colors.onSurface, fontWeight: 500, marginBottom: '0.25rem' }}>
                {s.question}
              </p>
              <p style={{ ...DS.text.bodyMd, color: DS.colors.tertiary }}>{s.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   CARDS LIST
   ═══════════════════════════════════════════ */
function CardsListPreview({ html }: { html: string }) {
  if (typeof document === 'undefined') return null
  const w = document.createElement('div')
  w.innerHTML = html
  const cards = Array.from(w.querySelectorAll('div[class*="glass-panel"]'))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
      {cards.map((card, i) => {
        const h3 = card.querySelector('h3')
        const p = card.querySelector('p')
        const badge = card.querySelector('span[class*="pill"]')
        return (
          <div key={i} style={{ ...DS.glass, padding: '1.25rem', border: `1px solid ${DS.colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
              <span style={{ ...DS.text.bodyMd, color: DS.colors.white, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {h3?.textContent?.trim()}
              </span>
              {badge && (
                <span style={{
                  flexShrink: 0,
                  border: `1px solid rgba(255,255,255,0.2)`,
                  color: DS.colors.onSurfaceVariant,
                  padding: '2px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                }}>
                  {badge.textContent?.trim()}
                </span>
              )}
            </div>
            {p && <p style={{ ...DS.text.bodyMd, color: DS.colors.tertiary }}>{p.textContent?.trim()}</p>}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════
   FALLBACK — HTML genérico
   ═══════════════════════════════════════════ */
function GenericBlockPreview({ html }: { html: string }) {
  // Extrai texto puro como fallback visual
  if (typeof document === 'undefined') return null
  const w = document.createElement('div')
  w.innerHTML = html
  return (
    <div style={{
      ...DS.glass,
      padding: '1rem 1.25rem',
      margin: '1rem 0',
      border: `1px solid ${DS.colors.borderPrimary15}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <AccentLine />
      <span style={{ ...DS.text.labelCaps, color: DS.colors.onSurfaceVariant, display: 'block', marginBottom: '0.5rem', fontSize: '9px' }}>
        Bloco do Design System
      </span>
      <p style={{ ...DS.text.bodyMd, color: DS.colors.onSurfaceVariant, fontSize: '12px' }}>
        {w.textContent?.trim().slice(0, 200)}
        {(w.textContent?.length ?? 0) > 200 ? '…' : ''}
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════
   ROTEADOR — escolhe o preview correto
   ═══════════════════════════════════════════ */
interface BlockPreviewProps { html: string }

export function BlockPreview({ html }: BlockPreviewProps) {
  const label = detectBlockLabel(html)

  if (label === 'Specs Grid') return <SpecsGridPreview html={html} />
  if (label === 'Citação') return <QuoteCardPreview html={html} />
  if (label === 'Tabela') return <TablePreview html={html} />
  if (label === 'Decision Flow') return <DecisionFlowPreview html={html} />
  if (label === 'Cards') return <CardsListPreview html={html} />
  return <GenericBlockPreview html={html} />
}
