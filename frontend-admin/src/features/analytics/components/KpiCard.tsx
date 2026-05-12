import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KpiCardProps {
  label: string
  value: string | number
  delta?: number | null
  inverted?: boolean // ex: bounceRate — menor é melhor
  hint?: string
  loading?: boolean
}

function fmt(n: string | number) {
  if (typeof n === 'number') {
    if (Math.abs(n) >= 1000) return new Intl.NumberFormat('pt-BR').format(Math.round(n))
    return String(Math.round(n * 100) / 100)
  }
  return n
}

export function KpiCard({ label, value, delta, inverted = false, hint, loading }: KpiCardProps) {
  const positive = delta == null ? null : inverted ? delta < 0 : delta > 0
  const Icon = delta == null || Math.abs(delta) < 0.5 ? Minus : positive ? ArrowUpRight : ArrowDownRight
  const color = delta == null || Math.abs(delta) < 0.5
    ? 'text-on-surface-variant'
    : positive
      ? 'text-primary-container'
      : 'text-rose-400'

  return (
    <div className="surface-card relative overflow-hidden p-5 border border-white/8 rounded-sm group hover:border-primary-container/30 transition-colors">
      <div className="text-label-caps uppercase tracking-[0.2em] text-on-surface-variant text-[11px] font-bold">
        {label}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className={cn('text-4xl font-bold tabular-nums tracking-tight text-white', loading && 'opacity-30 animate-pulse')}>
          {loading ? '—' : fmt(value)}
        </div>
        {delta != null && !loading && (
          <div className={cn('flex items-center gap-0.5 text-xs font-bold tabular-nums', color)}>
            <Icon className="h-3.5 w-3.5" />
            <span>{Math.abs(delta).toFixed(1)}%</span>
          </div>
        )}
      </div>
      {hint && <div className="mt-1 text-[11px] text-on-surface-variant">{hint}</div>}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}
