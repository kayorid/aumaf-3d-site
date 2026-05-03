import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { HtmlBlockView } from './HtmlBlockView'

/**
 * Tiptap extension para blocos HTML do design system (glass-panel, grids, etc.).
 *
 * No modo Visual, cada bloco é renderizado como preview real com opção de editar via modal.
 * Ao salvar, serializa de volta como HTML literal — preservado no Markdown e no público.
 */
export const HtmlBlock = Node.create({
  name: 'htmlBlock',
  group: 'block',
  atom: true, // edita apenas via NodeView (não pelo cursor de texto)

  addAttributes() {
    return {
      html: { default: '' },
    }
  },

  parseHTML() {
    return [
      // glass-panel é a classe-chave do DS nos blocos ricos
      {
        tag: 'div[class*="glass-panel"]',
        getAttrs: (el) => ({ html: (el as HTMLElement).outerHTML }),
        priority: 80,
      },
      {
        tag: 'blockquote[class*="glass-panel"]',
        getAttrs: (el) => ({ html: (el as HTMLElement).outerHTML }),
        priority: 80,
      },
      {
        tag: 'figure[class*="glass-panel"]',
        getAttrs: (el) => ({ html: (el as HTMLElement).outerHTML }),
        priority: 80,
      },
      // grids ricos (materiais, specs)
      {
        tag: 'div[class*="grid"][class*="gap"]',
        getAttrs: (el) => ({ html: (el as HTMLElement).outerHTML }),
        priority: 70,
      },
      {
        tag: 'div[class*="space-y"]',
        getAttrs: (el) => ({ html: (el as HTMLElement).outerHTML }),
        priority: 70,
      },
    ]
  },

  renderHTML({ node }) {
    // Emite um <div data-html-block> cujo innerHTML é o HTML original.
    // O htmlToMarkdown detecta esse atributo e lê innerHTML para preservar o HTML.
    // Usamos innerHTML via DOMParser side (NodeView); aqui emitimos o HTML como filho de texto.
    return [
      'div',
      mergeAttributes({ 'data-html-block': 'true', 'data-content': node.attrs.html }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(HtmlBlockView)
  },
})
