import { useTopPages } from '../hooks/use-analytics'
import { useRange } from '../hooks/use-range'

function fmtDuration(s: number) {
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m}m ${r}s` : `${r}s`
}

export function TopPagesTable() {
  const range = useRange((s) => s.range())
  const { data, isLoading } = useTopPages(range, 20)
  const max = data?.[0]?.pageviews ?? 0
  return (
    <div className="surface-card border border-white/8 rounded-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <h3 className="text-label-caps uppercase tracking-[0.2em] text-on-surface-variant text-[11px] font-bold">
          Páginas mais vistas
        </h3>
        <span className="text-xs text-on-surface-variant">{data?.length ?? 0}</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-white/[0.02]">
          <tr className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
            <th className="text-left  px-5 py-2 font-bold">Path</th>
            <th className="text-right px-3 py-2 font-bold">Pageviews</th>
            <th className="text-right px-3 py-2 font-bold">Únicos</th>
            <th className="text-right px-3 py-2 font-bold">Tempo médio</th>
            <th className="text-right px-5 py-2 font-bold">Bounce</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr><td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant">Carregando…</td></tr>
          )}
          {!isLoading && (data?.length ?? 0) === 0 && (
            <tr><td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant">Sem dados no período.</td></tr>
          )}
          {data?.map((p) => {
            const pct = max > 0 ? (p.pageviews / max) * 100 : 0
            return (
              <tr key={p.path} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <div className="font-medium text-white truncate max-w-[480px]" title={p.path}>{p.path}</div>
                  <div className="mt-1 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container/60" style={{ width: `${pct}%` }} />
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-white">{p.pageviews.toLocaleString('pt-BR')}</td>
                <td className="px-3 py-3 text-right tabular-nums text-on-surface-variant">{p.uniqueVisitors.toLocaleString('pt-BR')}</td>
                <td className="px-3 py-3 text-right tabular-nums text-on-surface-variant">{fmtDuration(p.avgDurationSeconds)}</td>
                <td className="px-5 py-3 text-right tabular-nums text-on-surface-variant">{(p.bounceRate * 100).toFixed(0)}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
