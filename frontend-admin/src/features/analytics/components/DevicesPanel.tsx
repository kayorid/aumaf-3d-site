import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useDevices } from '../hooks/use-analytics'
import { useAnalyticsRange } from '../hooks/use-range'
import { cn } from '@/lib/utils'

type Dim = 'device' | 'os' | 'browser' | 'country' | 'utm_source' | 'referrer'
const DIMS: { value: Dim; label: string }[] = [
  { value: 'device',     label: 'Device' },
  { value: 'os',         label: 'SO' },
  { value: 'browser',    label: 'Navegador' },
  { value: 'country',    label: 'País' },
  { value: 'utm_source', label: 'UTM Source' },
  { value: 'referrer',   label: 'Referrer' },
]

const COLORS = ['#61c54f', '#4aa83a', '#3c8a30', '#316f27', '#268519', '#7be466', '#a5f291', '#cbf8be']

export function DevicesPanel() {
  const range = useAnalyticsRange()
  const [dim, setDim] = useState<Dim>('device')
  const { data, isLoading } = useDevices(range, dim)

  const top = (data ?? []).slice(0, 8)
  const total = top.reduce((acc, r) => acc + r.sessions, 0)

  return (
    <div className="surface-card border border-white/8 rounded-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-label-caps uppercase tracking-[0.2em] text-on-surface-variant text-[11px] font-bold">
          Devices & Fontes
        </h3>
        <div className="inline-flex flex-wrap gap-1">
          {DIMS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDim(d.value)}
              className={cn(
                'px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] rounded-sm border transition-colors',
                dim === d.value
                  ? 'bg-primary-container text-on-primary border-primary-container'
                  : 'border-white/15 text-on-surface-variant hover:text-white hover:border-primary-container/40',
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-64">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">Carregando…</div>
          ) : top.length === 0 ? (
            <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">Sem dados.</div>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={top} dataKey="sessions" nameKey="value" innerRadius={50} outerRadius={88} stroke="#000">
                  {top.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0a0a0a',
                    border: '1px solid rgba(97,197,79,0.4)',
                    borderRadius: 2,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <ul className="space-y-2">
          {top.map((row, i) => {
            const pct = total > 0 ? (row.sessions / total) * 100 : 0
            return (
              <li key={`${row.value}-${i}`} className="flex items-center gap-3 text-sm">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-white font-medium truncate flex-1" title={row.value}>{row.value || '—'}</span>
                <span className="text-on-surface-variant tabular-nums">{row.sessions.toLocaleString('pt-BR')}</span>
                <span className="text-on-surface-variant tabular-nums text-xs w-12 text-right">{pct.toFixed(1)}%</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
