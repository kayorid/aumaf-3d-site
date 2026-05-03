import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { HtmlBlockView } from './HtmlBlockView'

/**
 * Tiptap extension para blocos HTML do design system (glass-panel, grids, etc.).
 *
 * Fluxo de dados:
 * 1. markdownToHtml: preserva os blocos do DS como HTML raw
 * 2. preprocessHtmlForTiptap: converte para <div data-html-block data-content="...">
 * 3. HtmlBlock.parseHTML: detecta [data-html-block] e extrai o HTML original de data-content
 * 4. NodeView (HtmlBlockView): renderiza preview visual + form de edição estruturado
 * 5. renderHTML: emite wrapper que htmlToMarkdown converte de volta para HTML literal
 */
export const HtmlBlock = Node.create({
  name: 'htmlBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      html: { default: '' },
    }
  },

  parseHTML() {
    return [
      // Detecta o wrapper gerado pelo preprocessHtmlForTiptap (prioridade máxima)
      {
        tag: 'div[data-html-block]',
        getAttrs: (node) => {
          const el = node as HTMLElement
          // data-content pode ter aspas escapadas (&quot;) — decodificar
          const raw = el.getAttribute('data-content') ?? el.innerHTML ?? ''
          const html = raw.replace(/&quot;/g, '"')
          return { html }
        },
        priority: 100,
      },
      // Fallback: divs do DS que chegarem sem pré-processamento (ex: copiar/colar)
      {
        tag: 'div',
        getAttrs: (node) => {
          const el = node as HTMLElement
          const cls = el.className || ''
          if (
            cls.includes('glass-panel') ||
            (cls.includes('space-y') && cls.includes('my')) ||
            cls.includes('space-y-3') ||
            cls.includes('space-y-4')
          ) {
            return { html: el.outerHTML }
          }
          return false
        },
        priority: 80,
      },
      {
        tag: 'blockquote',
        getAttrs: (node) => {
          const el = node as HTMLElement
          if (el.className.includes('glass-panel')) {
            return { html: el.outerHTML }
          }
          return false
        },
        priority: 80,
      },
      {
        tag: 'figure',
        getAttrs: (node) => {
          const el = node as HTMLElement
          if (el.className.includes('glass-panel')) {
            return { html: el.outerHTML }
          }
          return false
        },
        priority: 80,
      },
    ]
  },

  renderHTML({ node }) {
    // Emite wrapper com data-content para que htmlToMarkdown possa extrair o HTML original
    return [
      'div',
      mergeAttributes({
        'data-html-block': 'true',
        'data-content': (node.attrs.html as string).replace(/"/g, '&quot;'),
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(HtmlBlockView)
  },
})
