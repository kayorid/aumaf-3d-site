import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  hint?: string
  variant?: 'neutral' | 'primary' | 'warn'
  loading?: boolean
}

const VARIANT_RING: Record<NonNullable<KpiCardProps['variant']>, string> = {
  neutral: 'border-border',
  primary: 'border-primary-500/30',
  warn: 'border-warn-500/30',
}

const VARIANT_ICON_BG: Record<NonNullable<KpiCardProps['variant']>, string> = {
  neutral: 'bg-surface-200 text-text-secondary',
  primary: 'bg-primary-500/10 text-primary-400',
  warn: 'bg-warn-500/10 text-warn-400',
}

export function KpiCard({ label, value, icon, hint, variant = 'neutral', loading }: KpiCardProps) {
  return (
    <div className={cn('surface-card p-5', VARIANT_RING[variant])}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
            {label}
          </div>
          {loading ? (
            <div className="h-9 w-20 rounded bg-surface-300 animate-pulse" />
          ) : (
            <div className="text-3xl font-semibold text-text-primary tabular-nums">{value}</div>
          )}
          {hint && <div className="text-xs text-text-tertiary mt-0.5">{hint}</div>}
        </div>
        <div
          className={cn(
            'flex items-center justify-center size-9 rounded-md',
            VARIANT_ICON_BG[variant],
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
