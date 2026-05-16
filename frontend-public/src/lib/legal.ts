/**
 * Helper para renderizar páginas legais (Política de Privacidade, Termos, Cookies)
 * a partir dos arquivos Markdown em `src/content/legal/`.
 *
 * O conteúdo canônico é versionado em `docs/legal/` e replicado para dentro
 * de `frontend-public/src/content/legal/` para que o build (e o Docker) tenham
 * acesso ao arquivo sem precisar resolver caminhos fora do workspace.
 *
 * Usamos `import.meta.glob` com `query: '?raw'` para que o Vite/Astro empacote
 * o conteúdo bruto dos .md no bundle — independente do cwd em runtime.
 */
import { Marked } from 'marked'

const marked = new Marked({ gfm: true, breaks: false })

// Eager glob: tudo já vem como string no bundle.
const RAW_DOCS = import.meta.glob('../content/legal/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export interface LegalDoc {
  /** HTML renderizado do corpo (já sem o H1 principal — usado no hero). */
  html: string
  /** Título principal extraído do primeiro H1. */
  title: string
  /** Data de vigência (ISO ou texto curto) extraída do frontmatter inline. */
  effectiveDate: string | null
  /** Versão da política (string semântica). */
  version: string | null
}

function findDocSource(slug: string): string {
  for (const [path, raw] of Object.entries(RAW_DOCS)) {
    if (path.endsWith(`/${slug}.md`)) return raw
  }
  throw new Error(`Legal doc not found: ${slug}`)
}

/**
 * Carrega o Markdown da pasta `content/legal/` e converte para HTML.
 * Extrai metadados a partir das primeiras linhas (formato:
 * `**Versão:** 1.0`, `**Vigente desde:** ...`).
 */
export function loadLegalDoc(slug: string): LegalDoc {
  const raw = findDocSource(slug)

  const lines = raw.split('\n')
  let title = ''
  let version: string | null = null
  let effectiveDate: string | null = null

  for (const line of lines) {
    if (!title && line.startsWith('# ')) {
      title = line.replace(/^#\s+/, '').trim()
      continue
    }
    const versionMatch = line.match(/\*\*Versão:\*\*\s*(.+)/i)
    if (versionMatch) version = versionMatch[1].trim()
    const dateMatch = line.match(/\*\*Vigente desde:\*\*\s*(.+)/i)
    if (dateMatch) effectiveDate = dateMatch[1].trim()
    if (line.trim() === '---' && title) break
  }

  // Remove o H1 inicial — vamos renderizá-lo no hero do template.
  const withoutH1 = raw.replace(/^#\s+.+$\n*/m, '')
  const html = marked.parse(withoutH1, { async: false }) as string

  return { html, title, effectiveDate, version }
}
