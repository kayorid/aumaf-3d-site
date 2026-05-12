import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Timeseries } from '../hooks/use-analytics'

interface Props {
  data?: Timeseries
  title: string
  loading?: boolean
}

const PRIMARY = '#61c54f'

export function TimeseriesChart({ data, title, loading }: Props) {
  const points = data?.points ?? []
  return (
    <div className="surface-card border border-white/8 rounded-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-label-caps uppercase tracking-[0.2em] text-on-surface-variant text-[11px] font-bold">
            {title}
          </div>
          <div className="text-xs text-on-surface-variant mt-1">{loading ? 'carregando…' : `${points.length} pontos`}</div>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.4} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="bucket"
              stroke="rgba(255,255,255,0.45)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => v.slice(5, 10)}
            />
            <YAxis stroke="rgba(255,255,255,0.45)" fontSize={10} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              contentStyle={{
                background: '#0a0a0a',
                border: '1px solid rgba(97,197,79,0.4)',
                borderRadius: 2,
                fontSize: 12,
              }}
              labelStyle={{ color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 10 }}
              itemStyle={{ color: PRIMARY }}
            />
            <Area type="monotone" dataKey="value" stroke={PRIMARY} strokeWidth={2} fill="url(#gradPrimary)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
