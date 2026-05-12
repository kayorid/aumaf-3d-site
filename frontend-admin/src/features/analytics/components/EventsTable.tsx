import { useState } from 'react'
import { useEvents } from '../hooks/use-analytics'
import { useRange } from '../hooks/use-range'
import { cn } from '@/lib/utils'

const TYPE_FILTERS = ['', 'click', 'pageview', 'form_submit', 'form_start', 'scroll', 'engagement', 'modal_open', 'outbound']

export function EventsTable() {
  const range = useRange((s) => s.range())
  const [type, setType] = useState<string>('')
  const { data, isLoading } = useEvents(range, type || undefined)
  const max = (data?.[0]?.count ?? 0)

  return (
    <div className="surface-card border border-white/8 rounded-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-label-caps uppercase tracking-[0.2em] text-on-surface-variant text-[11px] font-bold">
          Eventos
        </h3>
        <div className="inline-flex flex-wrap gap-1">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t || 'all'}
              onClick={() => setType(t)}
              className={cn(
                'px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] rounded-sm border transition-colors',
                type === t
                  ? 'bg-primary-container text-on-primary border-primary-container'
                  : 'border-white/15 text-on-surface-variant hover:text-white hover:border-primary-container/40',
              )}
            >
              {t || 'todos'}
            </button>
          ))}
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-white/[0.02]">
          <tr className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
            <th className="text-left  px-5 py-2 font-bold">Tipo</th>
            <th className="text-left  px-3 py-2 font-bold">Nome</th>
            <th className="text-right px-3 py-2 font-bold">Total</th>
            <th className="text-right px-5 py-2 font-bold">Visitantes</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr><td colSpan={4} className="px-5 py-8 text-center text-on-surface-variant">Carregando…</td></tr>
          )}
          {!isLoading && (data?.length ?? 0) === 0 && (
            <tr><td colSpan={4} className="px-5 py-8 text-center text-on-surface-variant">Sem eventos no período.</td></tr>
          )}
          {data?.map((e, i) => {
            const pct = max > 0 ? (e.count / max) * 100 : 0
            return (
              <tr key={`${e.type}-${e.name}-${i}`} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <span className="inline-flex items-center rounded-sm border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
                    {e.type}
                  </span>
                </td>
                <td className="px-3 py-3 text-white font-medium">
                  <div>{e.name ?? <span className="text-on-surface-variant italic">— (sem nome)</span>}</div>
                  <div className="mt-1 h-1 w-full max-w-[280px] bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container/60" style={{ width: `${pct}%` }} />
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-white">{e.count.toLocaleString('pt-BR')}</td>
                <td className="px-5 py-3 text-right tabular-nums text-on-surface-variant">{e.uniqueVisitors.toLocaleString('pt-BR')}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
