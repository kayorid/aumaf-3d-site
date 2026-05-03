import { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Code2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BlockEditorModal } from './BlockEditorModal'

/**
 * NodeView visual para HtmlBlock.
 *
 * - Preview: renderiza o HTML do DS com as classes reais.
 * - Clique em "Editar": abre BlockEditorModal com form estruturado por tipo.
 * - Escape hatch "HTML bruto" no modal para quem precisa ajuste avançado.
 */
export function HtmlBlockView({ node, updateAttributes, selected }: NodeViewProps) {
  const [editing, setEditing] = useState(false)
  const [rawMode, setRawMode] = useState(false)
  const [rawDraft, setRawDraft] = useState('')

  const html: string = node.attrs.html ?? ''
  const blockLabel = detectBlockLabel(html)

  const openEditor = () => {
    setRawMode(false)
    setEditing(true)
  }

  const openRaw = () => {
    setRawDraft(html)
    setRawMode(true)
    setEditing(true)
  }

  return (
    <NodeViewWrapper
      className={cn(
        'relative my-4 rounded-sm border transition-all duration-150',
        selected ? 'border-primary-container/60 ring-1 ring-primary-container/30' : 'border-white/10',
      )}
      data-drag-handle
    >
      {/* Badge + botão de edição */}
      <div className="absolute -top-3 left-3 flex items-center gap-1.5 z-10">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/20 border border-primary-container/50 text-primary-container text-[9px] uppercase tracking-widest">
          <Code2 className="size-2.5" />
          {blockLabel}
        </span>
        <button
          type="button"
          onClick={openEditor}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-high border border-white/15 text-on-surface-variant text-[9px] uppercase tracking-widest hover:border-primary-container/40 hover:text-primary-container transition-colors"
        >
          <Pencil className="size-2.5" />
          Editar
        </button>
      </div>

      {/* Preview — pointer-events-none para não capturar cliques do Tiptap */}
      <div
        className="pointer-events-none select-none overflow-hidden rounded-sm p-1"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Modal estruturado por tipo */}
      {editing && !rawMode && (
        <BlockEditorModal
          html={html}
          blockLabel={blockLabel}
          onConfirm={(newHtml) => {
            updateAttributes({ html: newHtml })
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
          onEditRaw={openRaw}
        />
      )}

      {/* Fallback: textarea raw */}
      {editing && rawMode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" role="dialog">
          <div className="bg-surface-low border border-white/15 rounded-sm w-full max-w-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-widest text-white">HTML Bruto</span>
              <button type="button" onClick={() => setEditing(false)} className="text-on-surface-variant hover:text-white">✕</button>
            </div>
            <textarea
              value={rawDraft}
              onChange={(e) => setRawDraft(e.target.value)}
              rows={16}
              className="w-full bg-surface-dim text-on-surface text-[11px] font-mono p-2 rounded-sm border border-white/15 focus:border-primary-container/60 focus:outline-none resize-y"
              spellCheck={false}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-[11px] uppercase tracking-widest text-on-surface-variant border border-white/15 rounded-sm hover:border-white/30"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => { updateAttributes({ html: rawDraft }); setEditing(false) }}
                className="px-3 py-1.5 text-[11px] uppercase tracking-widest text-primary-container border border-primary-container/50 rounded-sm hover:bg-primary-container/10"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  )
}

export function detectBlockLabel(html: string): string {
  if (html.includes('Dados do Projeto') || (html.includes('pb-3') && html.includes('tracking-widest'))) return 'Specs Grid'
  if (html.includes('border-l-2') && html.includes('cite')) return 'Citação'
  if (html.includes('<table')) return 'Tabela'
  if (html.includes('rounded-full') && html.includes('items-start') && html.includes('text-tertiary text-body-md')) return 'Decision Flow'
  if (html.includes('space-y-3') || html.includes('space-y-4')) return 'Cards'
  if (html.includes('grid') && html.includes('gap')) return 'Grid'
  if (html.includes('figure') || html.includes('figcaption')) return 'Figura'
  return 'Bloco HTML'
}
