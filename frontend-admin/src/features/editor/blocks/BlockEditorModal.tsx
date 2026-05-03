import { useState } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  parseSpecsGrid, generateSpecsGrid,
  parseQuoteCard, generateQuoteCard,
  parseInfoCard, generateInfoCard,
  parseCardsList, generateCardsList,
  parseDecisionFlow, generateDecisionFlow,
  parseComparisonTable, generateComparisonTable,
} from './block-parser'

interface Props {
  html: string
  blockLabel: string
  onConfirm: (newHtml: string) => void
  onCancel: () => void
  onEditRaw: () => void
}

export function BlockEditorModal({ html, blockLabel, onConfirm, onCancel, onEditRaw }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-surface-low border border-white/15 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-white">{blockLabel}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEditRaw}
              className="text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors"
            >
              HTML bruto
            </button>
            <button type="button" onClick={onCancel} className="text-on-surface-variant hover:text-white p-1">
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="p-5">
          {blockLabel === 'Specs Grid' && (
            <SpecsGridEditor html={html} onConfirm={onConfirm} onCancel={onCancel} />
          )}
          {blockLabel === 'Citação' && (
            <QuoteCardEditor html={html} onConfirm={onConfirm} onCancel={onCancel} />
          )}
          {blockLabel === 'Cards' && (
            <CardsListEditor html={html} onConfirm={onConfirm} onCancel={onCancel} />
          )}
          {blockLabel === 'Decision Flow' && (
            <DecisionFlowEditor html={html} onConfirm={onConfirm} onCancel={onCancel} />
          )}
          {blockLabel === 'Tabela' && (
            <TableEditor html={html} onConfirm={onConfirm} onCancel={onCancel} />
          )}
          {(blockLabel === 'Bloco HTML' || blockLabel === 'Grid' || blockLabel === 'Figura') && (
            <InfoCardEditor html={html} onConfirm={onConfirm} onCancel={onCancel} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ===== Specs Grid ===== */
function SpecsGridEditor({ html, onConfirm, onCancel }: EditorProps) {
  const [data, setData] = useState(() => parseSpecsGrid(html))

  const updateItem = (i: number, field: 'label' | 'value', val: string) =>
    setData((d) => ({ ...d, items: d.items.map((it, j) => j === i ? { ...it, [field]: val } : it) }))

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Título do card</Label>
        <Input value={data.title} onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Itens</Label>
          <button
            type="button"
            onClick={() => setData((d) => ({ ...d, items: [...d.items, { label: '', value: '' }] }))}
            className="text-[11px] text-primary-container hover:underline flex items-center gap-1"
          >
            <Plus className="size-3" /> Adicionar item
          </button>
        </div>
        <div className="space-y-2">
          {data.items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <Input placeholder="Label" value={it.label} onChange={(e) => updateItem(i, 'label', e.target.value)} />
              <Input placeholder="Valor" value={it.value} onChange={(e) => updateItem(i, 'value', e.target.value)} />
              <button
                type="button"
                onClick={() => setData((d) => ({ ...d, items: d.items.filter((_, j) => j !== i) }))}
                className="text-on-surface-variant hover:text-error p-1"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <ModalFooter onConfirm={() => onConfirm(generateSpecsGrid(data))} onCancel={onCancel} />
    </div>
  )
}

/* ===== Quote Card ===== */
function QuoteCardEditor({ html, onConfirm, onCancel }: EditorProps) {
  const [data, setData] = useState(() => parseQuoteCard(html))
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Citação</Label>
        <Textarea rows={4} value={data.text} onChange={(e) => setData((d) => ({ ...d, text: e.target.value }))} placeholder="Texto da citação..." />
      </div>
      <div className="space-y-1.5">
        <Label>Autor / Fonte</Label>
        <Input value={data.author} onChange={(e) => setData((d) => ({ ...d, author: e.target.value }))} placeholder="Nome da pessoa ou empresa" />
      </div>
      <ModalFooter onConfirm={() => onConfirm(generateQuoteCard(data))} onCancel={onCancel} />
    </div>
  )
}

/* ===== Info Card ===== */
function InfoCardEditor({ html, onConfirm, onCancel }: EditorProps) {
  const [data, setData] = useState(() => parseInfoCard(html))
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Título</Label>
        <Input value={data.title} onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))} />
      </div>
      <div className="space-y-1.5">
        <Label>Descrição</Label>
        <Textarea rows={4} value={data.description} onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))} />
      </div>
      <label className="flex items-center gap-2 text-[12px] text-on-surface-variant cursor-pointer">
        <input type="checkbox" checked={data.accent} onChange={(e) => setData((d) => ({ ...d, accent: e.target.checked }))} className="rounded" />
        Destaque com borda verde
      </label>
      <ModalFooter onConfirm={() => onConfirm(generateInfoCard(data))} onCancel={onCancel} />
    </div>
  )
}

/* ===== Cards List ===== */
function CardsListEditor({ html, onConfirm, onCancel }: EditorProps) {
  const [data, setData] = useState(() => parseCardsList(html))
  const update = (i: number, field: 'title' | 'description', val: string) =>
    setData((d) => ({ ...d, items: d.items.map((it, j) => j === i ? { ...it, [field]: val } : it) }))
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Cards</Label>
        <button
          type="button"
          onClick={() => setData((d) => ({ ...d, items: [...d.items, { title: '', description: '' }] }))}
          className="text-[11px] text-primary-container hover:underline flex items-center gap-1"
        >
          <Plus className="size-3" /> Adicionar card
        </button>
      </div>
      {data.items.map((it, i) => (
        <div key={i} className="glass-panel rounded-sm p-4 border border-white/10 space-y-2 relative">
          <button
            type="button"
            onClick={() => setData((d) => ({ ...d, items: d.items.filter((_, j) => j !== i) }))}
            className="absolute top-2 right-2 text-on-surface-variant hover:text-error"
          >
            <Trash2 className="size-3.5" />
          </button>
          <Input placeholder="Título" value={it.title} onChange={(e) => update(i, 'title', e.target.value)} />
          <Textarea rows={2} placeholder="Descrição" value={it.description} onChange={(e) => update(i, 'description', e.target.value)} />
        </div>
      ))}
      <ModalFooter onConfirm={() => onConfirm(generateCardsList(data))} onCancel={onCancel} />
    </div>
  )
}

/* ===== Decision Flow ===== */
function DecisionFlowEditor({ html, onConfirm, onCancel }: EditorProps) {
  const [data, setData] = useState(() => parseDecisionFlow(html))
  const update = (i: number, field: 'question' | 'yes' | 'no', val: string) =>
    setData((d) => ({ ...d, steps: d.steps.map((s, j) => j === i ? { ...s, [field]: val } : s) }))
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Passos de decisão</Label>
        <button
          type="button"
          onClick={() => setData((d) => ({ ...d, steps: [...d.steps, { question: '', yes: '', no: '' }] }))}
          className="text-[11px] text-primary-container hover:underline flex items-center gap-1"
        >
          <Plus className="size-3" /> Adicionar passo
        </button>
      </div>
      {data.steps.map((s, i) => (
        <div key={i} className="glass-panel rounded-sm p-4 border border-white/10 space-y-2 relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container text-[10px] font-bold flex-shrink-0">{i + 1}</span>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Pergunta</span>
            <button
              type="button"
              onClick={() => setData((d) => ({ ...d, steps: d.steps.filter((_, j) => j !== i) }))}
              className="ml-auto text-on-surface-variant hover:text-error"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
          <Input placeholder="Qual a pergunta de decisão?" value={s.question} onChange={(e) => update(i, 'question', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] text-primary-container uppercase tracking-widest block">Sim →</span>
              <Input placeholder="Se sim..." value={s.yes} onChange={(e) => update(i, 'yes', e.target.value)} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest block">Não →</span>
              <Input placeholder="Se não..." value={s.no} onChange={(e) => update(i, 'no', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <ModalFooter onConfirm={() => onConfirm(generateDecisionFlow(data))} onCancel={onCancel} />
    </div>
  )
}

/* ===== Comparison Table ===== */
function TableEditor({ html, onConfirm, onCancel }: EditorProps) {
  const [data, setData] = useState(() => parseComparisonTable(html))

  const updateHeader = (i: number, val: string) =>
    setData((d) => ({ ...d, headers: d.headers.map((h, j) => j === i ? val : h) }))
  const updateCell = (ri: number, ci: number, val: string) =>
    setData((d) => ({ ...d, rows: d.rows.map((row, j) => j === ri ? row.map((c, k) => k === ci ? val : c) : row) }))
  const addCol = () =>
    setData((d) => ({ headers: [...d.headers, 'Col'], rows: d.rows.map((r) => [...r, '']) }))
  const addRow = () =>
    setData((d) => ({ ...d, rows: [...d.rows, d.headers.map(() => '')] }))
  const removeRow = (ri: number) =>
    setData((d) => ({ ...d, rows: d.rows.filter((_, j) => j !== ri) }))

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr>
              {data.headers.map((h, i) => (
                <th key={i} className="px-2 py-1">
                  <Input value={h} onChange={(e) => updateHeader(i, e.target.value)} className="text-[11px] min-w-[80px]" />
                </th>
              ))}
              <th>
                <button type="button" onClick={addCol} className="text-primary-container hover:underline text-[11px]">
                  <Plus className="size-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri}>
                {data.headers.map((_, ci) => (
                  <td key={ci} className="px-2 py-1">
                    <Input value={row[ci] ?? ''} onChange={(e) => updateCell(ri, ci, e.target.value)} className="text-[11px]" />
                  </td>
                ))}
                <td>
                  <button type="button" onClick={() => removeRow(ri)} className="text-on-surface-variant hover:text-error p-1">
                    <Trash2 className="size-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className="text-[11px] text-primary-container hover:underline flex items-center gap-1">
        <Plus className="size-3" /> Adicionar linha
      </button>
      <ModalFooter onConfirm={() => onConfirm(generateComparisonTable(data))} onCancel={onCancel} />
    </div>
  )
}

/* ===== shared ===== */
interface EditorProps { html: string; onConfirm: (html: string) => void; onCancel: () => void }

function ModalFooter({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
      <Button type="button" variant="ghost" size="md" onClick={onCancel}>Cancelar</Button>
      <Button type="button" size="md" onClick={onConfirm}>
        <Check className="size-3.5" /> Confirmar
      </Button>
    </div>
  )
}
