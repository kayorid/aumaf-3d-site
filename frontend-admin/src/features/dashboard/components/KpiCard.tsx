import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: number | string
  number: string
  icon: React.ReactNode
  hint?: string
  variant?: 'neutral' | 'primary' | 'warn'
  loading?: boolean
}

const VARIANT_BORDER: Record<NonNullable<KpiCardProps['variant']>, string> = {
  neutral: 'border-white/10',
  primary: 'border-primary-container/30',
  warn: 'border-yellow-400/25',
}

const VARIANT_ICON_TONE: Record<NonNullable<KpiCardProps['variant']>, string> = {
  neutral: 'text-on-surface-variant',
  primary: 'text-primary-container',
  warn: 'text-yellow-300',
}

const VARIANT_NUMBER_TONE: Record<NonNullable<KpiCardProps['variant']>, string> = {
  neutral: 'text-on-surface-variant/60',
  primary: 'text-primary-container/80',
  warn: 'text-yellow-400/80',
}

export function KpiCard({ label, value, number, icon, hint, variant = 'neutral', loading }: KpiCardProps) {
  return (
    <div
      className={cn(
        'group relative bg-surface-low/60 border rounded-sm p-5 transition-colors hover:bg-surface-base',
        VARIANT_BORDER[variant],
      )}
    >
      <div
        className={cn(
          'absolute top-3 left-3 text-[9px] font-mono tracking-[0.2em]',
          VARIANT_NUMBER_TONE[variant],
        )}
      >
        / {number}
      </div>

      <div
        className={cn(
          'absolute top-3 right-3 [&_svg]:size-3.5',
          VARIANT_ICON_TONE[variant],
        )}
      >
        {icon}
      </div>

      <div className="pt-8 flex flex-col gap-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          {label}
        </div>

        {loading ? (
          <div className="h-10 w-20 bg-white/5 animate-pulse" />
        ) : (
          <div className="text-[clamp(28px,3vw,36px)] font-bold text-white leading-none tabular-nums tracking-[-0.02em]">
            {value}
          </div>
        )}

        {hint && (
          <div className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/70 mt-1">
            {hint}
          </div>
        )}
      </div>
    </div>
  )
}
