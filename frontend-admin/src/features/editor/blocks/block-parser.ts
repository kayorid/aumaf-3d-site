/**
 * Parseia HTML de blocos do design system de volta para dados estruturados.
 *
 * IMPORTANTE: não usar seletores CSS com caracteres especiais como / (barra).
 * Classes Tailwind como `border-white/8` usam barra que o querySelector
 * interpreta como separador de namespace — quebra o parse silenciosamente.
 * Usar sempre [class*="substring"] ou seletores estruturais (nth-child, etc.).
 */

/* ===== Specs Grid ===== */

export interface SpecsGridData {
  title: string
  items: { label: string; value: string }[]
}

export function parseSpecsGrid(html: string): SpecsGridData {
  if (typeof document === 'undefined') return { title: 'Dados do Projeto', items: [{ label: '', value: '' }] }
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html

  // Título: span com tracking-[0.2em] ou primeiro span uppercase com class*="on-surface-variant"
  const titleEl =
    wrapper.querySelector('span[class*="tracking-\\[0"]') ||
    wrapper.querySelector('span[class*="on-surface-variant"][class*="uppercase"]') ||
    wrapper.querySelector('span[class*="tracking-widest"][class*="uppercase"]')
  const title = titleEl?.textContent?.trim() ?? 'Dados do Projeto'

  // Itens: divs que contêm exatamente 2 spans (label + value)
  // Evita seletores com `/` — usa class*="pb-" como heurística
  const items: SpecsGridData['items'] = []
  const itemDivs = wrapper.querySelectorAll('div[class*="pb-"]')
  itemDivs.forEach((div) => {
    const spans = div.querySelectorAll('span')
    if (spans.length >= 2) {
      const label = spans[0].textContent?.trim() ?? ''
      const value = spans[1].textContent?.trim() ?? ''
      if (label || value) {
        items.push({ label, value })
      }
    }
  })

  // Fallback: tentar pegar texto de qualquer div com class*="border-b"
  if (items.length === 0) {
    wrapper.querySelectorAll('div[class*="border-b"]').forEach((div) => {
      const spans = div.querySelectorAll('span')
      if (spans.length >= 2) {
        const label = spans[0].textContent?.trim() ?? ''
        const value = spans[1].textContent?.trim() ?? ''
        if (label || value) items.push({ label, value })
      }
    })
  }

  return { title, items: items.length > 0 ? items : [{ label: '', value: '' }] }
}

export function generateSpecsGrid(data: SpecsGridData): string {
  const items = data.items
    .filter((it) => it.label || it.value)
    .map(
      (it) =>
        `<div class="border-b border-white/8 pb-3"><span class="text-label-caps text-on-surface-variant uppercase tracking-widest block text-[10px] mb-0.5">${esc(it.label)}</span><span class="text-body-md text-on-surface font-medium">${esc(it.value)}</span></div>`,
    )
    .join('\n')
  return `<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<span class="text-label-caps text-on-surface-variant uppercase tracking-[0.2em] block mb-4">${esc(data.title)}</span>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
${items}
</div>
</div>`
}

/* ===== Quote Card ===== */

export interface QuoteCardData {
  text: string
  author: string
}

export function parseQuoteCard(html: string): QuoteCardData {
  if (typeof document === 'undefined') return { text: '', author: '' }
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  // Texto: primeiro <p> dentro do blockquote
  const pEl = wrapper.querySelector('blockquote p') || wrapper.querySelector('p[class*="italic"]') || wrapper.querySelector('p')
  const text = (pEl?.textContent ?? '').replace(/^["“]|["”]$/g, '').trim()
  // Autor: elemento <cite>
  const citeEl = wrapper.querySelector('cite') || wrapper.querySelector('[class*="tracking-\\[0"]')
  const author = (citeEl?.textContent ?? '').replace(/^—\s*/, '').trim()
  return { text, author }
}

export function generateQuoteCard(data: QuoteCardData): string {
  return `<blockquote class="glass-panel border-l-2 border-primary-container p-6 my-8 rounded-sm relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
<p class="text-body-lg text-on-surface italic leading-relaxed mb-3">"${esc(data.text)}"</p>
<footer><cite class="text-label-caps text-primary-container uppercase tracking-[0.15em] not-italic">— ${esc(data.author)}</cite></footer>
</blockquote>`
}

/* ===== Info Card ===== */

export interface InfoCardData {
  title: string
  description: string
  accent: boolean
}

export function parseInfoCard(html: string): InfoCardData {
  if (typeof document === 'undefined') return { title: '', description: '', accent: false }
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  const h3 = wrapper.querySelector('h3')
  const p = wrapper.querySelector('p')
  // Detecta accent por presença de border-primary-container no class (sem /)
  const mainDiv = wrapper.querySelector('div[class*="glass-panel"]')
  const accent = (mainDiv?.className ?? '').includes('primary-container')
  return {
    title: h3?.textContent?.trim() ?? '',
    description: p?.textContent?.trim() ?? '',
    accent,
  }
}

export function generateInfoCard(data: InfoCardData): string {
  const borderCls = data.accent ? 'border-primary-container/20' : 'border-white/8'
  const accentLine = data.accent
    ? '<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>\n'
    : ''
  return `<div class="glass-panel rounded-sm p-5 ${borderCls} relative overflow-hidden my-4">
${accentLine}<h3 class="text-body-lg font-bold text-white mb-2">${esc(data.title)}</h3>
<p class="text-body-md text-tertiary leading-relaxed">${esc(data.description)}</p>
</div>`
}

/* ===== Cards List ===== */

export interface CardItem { title: string; description: string }
export interface CardsListData { items: CardItem[] }

export function parseCardsList(html: string): CardsListData {
  if (typeof document === 'undefined') return { items: [{ title: '', description: '' }] }
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  // Cada card é um div com glass-panel
  const cards = wrapper.querySelectorAll('div[class*="glass-panel"]')
  const items: CardItem[] = []
  cards.forEach((card) => {
    const h3 = card.querySelector('h3')
    const p = card.querySelector('p')
    // Só incluir se tem pelo menos h3 ou p com texto
    const title = h3?.textContent?.trim() ?? ''
    const description = p?.textContent?.trim() ?? ''
    if (title || description) {
      items.push({ title, description })
    }
  })
  return { items: items.length > 0 ? items : [{ title: '', description: '' }] }
}

export function generateCardsList(data: CardsListData): string {
  const cards = data.items.map(
    (it) =>
      `<div class="glass-panel rounded-sm p-5 border border-white/8">
<h3 class="text-body-md font-bold text-white mb-2">${esc(it.title)}</h3>
<p class="text-body-md text-tertiary leading-relaxed">${esc(it.description)}</p>
</div>`,
  )
  return `<div class="space-y-3 my-6">\n${cards.join('\n')}\n</div>`
}

/* ===== Decision Flow ===== */

export interface DecisionStep { question: string; yes: string; no: string }
export interface DecisionFlowData { steps: DecisionStep[] }

export function parseDecisionFlow(html: string): DecisionFlowData {
  if (typeof document === 'undefined') return { steps: [{ question: '', yes: '', no: '' }] }
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  // Cada step é um div.flex com um span de número + div de conteúdo
  const rows = wrapper.querySelectorAll('div[class*="flex"][class*="gap-4"]')
  const steps: DecisionStep[] = []
  rows.forEach((row) => {
    // Pergunta: p com class*="font-medium" ou primeiro p
    const qEl = row.querySelector('p[class*="font-medium"]') || row.querySelector('p')
    // Resposta: segundo p (ou p com class*="text-tertiary")
    const pEls = row.querySelectorAll('p')
    const ansEl = pEls.length > 1 ? pEls[1] : null
    if (qEl) {
      const ansText = ansEl?.textContent ?? ''
      const yesMatch = ansText.match(/[Ss]im[:\s]*([^→.—]+)/)?.[1]?.trim() ?? ''
      const noMatch = ansText.match(/[Nn][aã]o[:\s]*([^→.—]+)/)?.[1]?.trim() ?? ''
      steps.push({
        question: qEl.textContent?.trim() ?? '',
        yes: yesMatch,
        no: noMatch,
      })
    }
  })
  return { steps: steps.length > 0 ? steps : [{ question: '', yes: '', no: '' }] }
}

export function generateDecisionFlow(data: DecisionFlowData): string {
  const steps = data.steps.map(
    (s, i) =>
      `<div class="flex gap-4 items-start">
<span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-label-caps font-bold">${i + 1}</span>
<div>
<p class="text-on-surface font-medium mb-1">${esc(s.question)}</p>
<p class="text-tertiary text-body-md">→ <strong class="text-primary-container">Sim:</strong> ${esc(s.yes)} → <strong class="text-on-surface">Não:</strong> ${esc(s.no)}</p>
</div>
</div>`,
  )
  return `<div class="glass-panel rounded-sm p-6 my-8 border border-primary-container/15 space-y-4 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
${steps.join('\n')}
</div>`
}

/* ===== Comparison Table ===== */

export interface TableData {
  headers: string[]
  rows: string[][]
}

export function parseComparisonTable(html: string): TableData {
  if (typeof document === 'undefined') return { headers: ['Col 1', 'Col 2'], rows: [] }
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  const headers = Array.from(wrapper.querySelectorAll('thead th')).map(
    (th) => th.textContent?.trim() ?? '',
  )
  const rows = Array.from(wrapper.querySelectorAll('tbody tr')).map((tr) =>
    Array.from(tr.querySelectorAll('td')).map((td) => td.textContent?.trim() ?? ''),
  )
  return {
    headers: headers.length > 0 ? headers : ['Col 1', 'Col 2'],
    rows,
  }
}

export function generateComparisonTable(data: TableData): string {
  const headers = data.headers
    .map(
      (h) =>
        `<th class="text-left px-4 py-3 text-label-caps text-primary-container uppercase tracking-widest">${esc(h)}</th>`,
    )
    .join('')
  const rows = data.rows
    .map((row, ri) => {
      const cells = data.headers
        .map((_, ci) => {
          const val = row[ci] ?? ''
          const cls = ci === 0 ? 'text-on-surface-variant' : 'text-on-surface'
          return `<td class="px-4 py-3 ${cls}">${esc(val)}</td>`
        })
        .join('')
      const border = ri < data.rows.length - 1 ? 'border-b border-white/5' : ''
      return `<tr class="${border}">${cells}</tr>`
    })
    .join('\n')
  return `<div class="glass-panel rounded-sm overflow-hidden border border-primary-container/15 my-8">
<table class="w-full text-body-md">
<thead>
<tr class="bg-primary-container/10 border-b border-white/10">${headers}</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>
</div>`
}

/* ===== util ===== */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
