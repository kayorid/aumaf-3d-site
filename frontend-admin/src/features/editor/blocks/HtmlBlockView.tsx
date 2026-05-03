import { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Code2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BlockEditorModal } from './BlockEditorModal'

/**
 * NodeView visual para HtmlBlock.
 *
 * IMPORTANTE — gestão de eventos em atom nodes:
 * O Tiptap captura mousedown em nodes atom para mover o cursor.
 * Para que botões dentro do NodeView funcionem, é necessário:
 * 1. `e.preventDefault()` no mousedown dos botões (impede o Tiptap de processar)
 * 2. Usar `onClick` para a ação (que dispara depois do mousedown não capturado)
 * 3. NÃO usar `data-drag-handle` no NodeViewWrapper raiz (causava conflito de drag vs click)
 */
export function HtmlBlockView({ node, updateAttributes, selected }: NodeViewProps) {
  const [editing, setEditing] = useState(false)
  const [rawMode, setRawMode] = useState(false)
  const [rawDraft, setRawDraft] = useState('')

  const html: string = node.attrs.html ?? ''
  const blockLabel = detectBlockLabel(html)

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setRawMode(false)
    setEditing(true)
  }

  return (
    <NodeViewWrapper
      className={cn(
        'my-4 rounded-sm border transition-all duration-150',
        selected ? 'border-primary-container/60 ring-1 ring-primary-container/30' : 'border-white/10',
      )}
    >
      {/* Barra de controle INLINE (não absolute) — não é cortada por overflow */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 border-b border-white/8 bg-surface-dim/60"
        onMouseDown={(e) => e.preventDefault()}
      >
        <span className="inline-flex items-center gap-1.5 text-primary-container text-[10px] uppercase tracking-[0.2em]">
          <Code2 className="size-3" />
          {blockLabel}
        </span>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleEditClick}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors ml-auto px-2 py-0.5 rounded border border-white/10 hover:border-primary-container/40"
        >
          <Pencil className="size-2.5" />
          Editar
        </button>
      </div>

      {/* Preview — pointer-events-none apenas no conteúdo (não na barra de controle) */}
      <div
        className="pointer-events-none select-none overflow-hidden p-3"
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
          onEditRaw={() => {
            setRawDraft(html)
            setRawMode(true)
          }}
        />
      )}

      {/* Fallback: textarea HTML bruto */}
      {editing && rawMode && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="bg-surface-low border border-white/15 rounded-sm w-full max-w-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-widest text-white">HTML Bruto</span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEditing(false)}
                className="text-on-surface-variant hover:text-white text-lg leading-none"
              >
                ✕
              </button>
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
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-[11px] uppercase tracking-widest text-on-surface-variant border border-white/15 rounded-sm hover:border-white/30"
              >
                Cancelar
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
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
  if (html.includes('Dados do Projeto') || (html.includes('pb-3') && html.includes('tracking-widest') && html.includes('border-b'))) return 'Specs Grid'
  if (html.includes('border-l-2') && html.includes('cite')) return 'Citação'
  if (html.includes('<table')) return 'Tabela'
  if (html.includes('rounded-full') && html.includes('items-start') && html.includes('font-bold')) return 'Decision Flow'
  if ((html.includes('space-y-3') || html.includes('space-y-4')) && !html.includes('border-l-2')) return 'Cards'
  if (html.includes('grid') && html.includes('gap')) return 'Grid'
  if (html.includes('figure') || html.includes('figcaption')) return 'Figura'
  return 'Bloco HTML'
}
