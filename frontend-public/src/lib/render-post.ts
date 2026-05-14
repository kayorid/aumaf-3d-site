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
import DOMPurify from 'isomorphic-dompurify'

const marked = new Marked({
  gfm: true,
  breaks: false,
  // html:true via default — Marked processa HTML inline
})

// Allowlist conservadora: cobre todo HTML produzido por Marked GFM + classes Tailwind do DS.
// onerror/onclick/javascript: URIs e <script>/<iframe>/<object> são bloqueados por design.
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
    'code', 'pre', 'blockquote', 'q', 'cite',
    'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    'br', 'hr', 'span', 'div', 'small', 'sub', 'sup', 'mark',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'src', 'srcset', 'sizes', 'alt', 'title',
    'class', 'id', 'loading', 'decoding', 'width', 'height',
    'colspan', 'rowspan', 'scope', 'lang', 'dir', 'aria-label', 'aria-hidden', 'role',
    'data-track', 'data-track-source', 'data-track-page',
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[/#?])/i,
  ADD_ATTR: ['target'], // permite target="_blank" em <a>
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'style'],
  KEEP_CONTENT: true,
}

export function renderPostContent(markdown: string): string {
  if (!markdown) return ''
  const html = marked.parse(markdown, { async: false }) as string
  return DOMPurify.sanitize(html, SANITIZE_CONFIG) as unknown as string
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
