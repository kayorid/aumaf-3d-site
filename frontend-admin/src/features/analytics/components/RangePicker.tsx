import { useRange, type RangePreset } from '../hooks/use-range'
import { cn } from '@/lib/utils'

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d',  label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
]

export function RangePicker() {
  const preset = useRange((s) => s.preset)
  const setPreset = useRange((s) => s.setPreset)
  return (
    <div className="inline-flex items-center gap-1 rounded-sm border border-white/15 bg-surface-low/40 p-1">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => setPreset(p.value)}
          className={cn(
            'px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] rounded-sm transition-colors',
            preset === p.value
              ? 'bg-primary-container text-on-primary glow-effect'
              : 'text-on-surface-variant hover:text-white hover:bg-white/5',
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
