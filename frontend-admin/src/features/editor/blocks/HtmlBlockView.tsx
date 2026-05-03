import { useState, useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Code2, Pencil, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * NodeView visual para HtmlBlock.
 *
 * - Preview: renderiza o HTML do DS com as classes reais via dangerouslySetInnerHTML.
 *   O visual é idêntico ao público pois as classes Tailwind do admin são as mesmas.
 * - Edição: clicando "Editar HTML" abre um textarea inline com o HTML bruto.
 *   Ao confirmar, atualiza o atributo `html` do node.
 * - Hover: mostra badge verde com o tipo de bloco detectado.
 */
export function HtmlBlockView({ node, updateAttributes, selected }: NodeViewProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const html: string = node.attrs.html ?? ''

  const blockLabel = detectBlockLabel(html)

  const startEdit = () => {
    setDraft(html)
    setEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const confirmEdit = () => {
    updateAttributes({ html: draft })
    setEditing(false)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft('')
  }

  return (
    <NodeViewWrapper
      className={cn(
        'relative my-4 rounded-sm border transition-all duration-150',
        selected ? 'border-primary-container/60 ring-1 ring-primary-container/30' : 'border-white/10',
      )}
      data-drag-handle
    >
      {/* Badge de tipo + botões de ação */}
      <div className="absolute -top-3 left-3 flex items-center gap-1.5 z-10">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/20 border border-primary-container/50 text-primary-container text-[9px] uppercase tracking-widest">
          <Code2 className="size-2.5" />
          {blockLabel}
        </span>
        {!editing && (
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-high border border-white/15 text-on-surface-variant text-[9px] uppercase tracking-widest hover:border-primary-container/40 hover:text-primary-container transition-colors"
          >
            <Pencil className="size-2.5" />
            Editar HTML
          </button>
        )}
      </div>

      {editing ? (
        /* Modo edição — textarea com o HTML bruto */
        <div className="p-3 space-y-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={12}
            className="w-full bg-surface-dim text-on-surface text-[11px] font-mono p-2 rounded-sm border border-white/15 focus:border-primary-container/60 focus:outline-none resize-y"
            spellCheck={false}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-widest text-on-surface-variant border border-white/15 rounded-sm hover:border-white/30 transition-colors"
            >
              <X className="size-3" /> Cancelar
            </button>
            <button
              type="button"
              onClick={confirmEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-widest text-primary-container border border-primary-container/50 rounded-sm hover:bg-primary-container/10 transition-colors"
            >
              <Check className="size-3" /> Confirmar
            </button>
          </div>
        </div>
      ) : (
        /* Modo preview — renderiza o HTML com classes do DS */
        <div
          className="pointer-events-none select-none overflow-hidden rounded-sm p-1"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </NodeViewWrapper>
  )
}

function detectBlockLabel(html: string): string {
  if (html.includes('Dados do Projeto') || (html.includes('<dl') && html.includes('<dt'))) return 'Specs Grid'
  if (html.includes('border-l-2') && html.includes('cite')) return 'Citação'
  if (html.includes('<table')) return 'Tabela'
  if (html.includes('w-8 h-8 rounded-full') || html.includes('flex gap-4 items-start')) return 'Decision Flow'
  if (html.includes('space-y') && html.includes('glass-panel')) return 'Cards'
  if (html.includes('grid') && html.includes('gap')) return 'Grid'
  if (html.includes('figure') || html.includes('figcaption')) return 'Figura'
  return 'Bloco HTML'
}
