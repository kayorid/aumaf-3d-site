/**
 * Renderer Markdown → HTML para posts dinâmicos.
 *
 * Estratégia: marked com html:true + sanitize-html allowlist conservadora.
 * Blocos HTML inline (com classes Tailwind do design system) são preservados.
 * Texto narrativo, headings, listas, tabelas GFM e blockquotes são convertidos do MD.
 *
 * Por que sanitize-html e não isomorphic-dompurify? DOMPurify puxa
 * html-encoding-sniffer → @exodus/bytes (ESM puro) que quebra o build do Astro
 * no Docker com ERR_REQUIRE_ESM. sanitize-html é CJS-compatible.
 *
 * As classes Tailwind usadas precisam estar safelisted em tailwind.config.ts
 * (já configurado em P2-A11).
 */
import { Marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

const marked = new Marked({
  gfm: true,
  breaks: false,
  // html:true via default — Marked processa HTML inline
})

// Allowlist conservadora: cobre todo HTML produzido por Marked GFM + classes Tailwind do DS.
// onerror/onclick/javascript: URIs e <script>/<iframe>/<object> são bloqueados por design.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
    'code', 'pre', 'blockquote', 'q', 'cite',
    'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    'br', 'hr', 'span', 'div', 'small', 'sub', 'sup', 'mark',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title', 'class', 'id'],
    img: ['src', 'srcset', 'sizes', 'alt', 'title', 'loading', 'decoding', 'width', 'height', 'class'],
    '*': [
      'class', 'id', 'lang', 'dir', 'role',
      'aria-label', 'aria-hidden', 'aria-describedby',
      'colspan', 'rowspan', 'scope',
      'data-track', 'data-track-source', 'data-track-page',
    ],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  // Mata HTML perigoso por design: <script>/<iframe>/<style>/<form>/inputs/<object>.
  // sanitize-html já remove tudo fora de allowedTags; explícito como guard de regressão.
  disallowedTagsMode: 'discard',
  // Atributos on* (onerror, onclick etc.) NÃO estão em allowedAttributes — removidos.
}

export function renderPostContent(markdown: string): string {
  if (!markdown) return ''
  const html = marked.parse(markdown, { async: false }) as string
  return sanitizeHtml(html, SANITIZE_OPTIONS)
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
