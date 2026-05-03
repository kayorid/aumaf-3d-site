/**
 * Renderer Markdown → HTML para posts dinâmicos.
 *
 * Estratégia: marked com html:true. Blocos HTML inline (com classes Tailwind do
 * design system) são preservados as-is. Texto narrativo, headings, listas,
 * tabelas GFM e blockquotes são convertidos do Markdown.
 *
 * As classes Tailwind usadas precisam estar safelisted em tailwind.config.ts
 * (já configurado em P2-A11).
 */
import { Marked } from 'marked'

const marked = new Marked({
  gfm: true,
  breaks: false,
  // html:true via default — Marked processa HTML inline
})

export function renderPostContent(markdown: string): string {
  if (!markdown) return ''
  return marked.parse(markdown, { async: false }) as string
}

/**
 * Helper para mês abreviado em pt-BR.
 * "2026-05-01" → "Mai 2026"
 */
const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function formatPostDateShort(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS_PT[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function formatPostDateLong(iso: string): string {
  const d = new Date(iso)
  return `${d.getUTCDate()} ${MONTHS_PT[d.getUTCMonth()].toLowerCase()} ${d.getUTCFullYear()}`
}
