import * as RSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectStyledOption<V extends string = string> {
  value: V
  label: React.ReactNode
  disabled?: boolean
}

interface Props<V extends string> {
  value: V
  onValueChange: (v: V) => void
  options: Array<SelectStyledOption<V>>
  id?: string
  ariaLabel?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Select com DS Cinematic Additive Manufacturing aplicado.
 * - Trigger preto + borda branca/15, focus verde
 * - Painel glass-panel com border verde sutil
 * - Item ativo: verde neon + check; hover: bg branco/5
 * - Cantos sharp (rounded-sm), tipografia uppercase tracking
 */
export function SelectStyled<V extends string>({
  value,
  onValueChange,
  options,
  id,
  ariaLabel,
  placeholder,
  disabled,
  className,
}: Props<V>) {
  return (
    <RSelect.Root value={value} onValueChange={(v) => onValueChange(v as V)} disabled={disabled}>
      <RSelect.Trigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex h-10 w-full items-center justify-between gap-2 rounded-sm border border-white/15 bg-surface-dim px-3 py-2 text-sm text-on-surface',
          'focus:outline-none focus:border-primary-container/60 focus:ring-1 focus:ring-primary-container/20',
          'data-[placeholder]:text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          className,
        )}
      >
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon asChild>
          <ChevronDown className="size-4 text-on-surface-variant" />
        </RSelect.Icon>
      </RSelect.Trigger>

      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={6}
          className={cn(
            'z-[60] min-w-[var(--radix-select-trigger-width)] overflow-hidden',
            'rounded-sm border border-primary-container/30 bg-black/95 backdrop-blur-md',
            'shadow-[0_0_30px_rgba(97,197,79,0.08)]',
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          )}
        >
          <RSelect.Viewport className="p-1">
            {options.map((opt) => (
              <RSelect.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className={cn(
                  'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-3 py-2 text-sm text-on-surface outline-none',
                  'data-[highlighted]:bg-white/5 data-[highlighted]:text-primary-container',
                  'data-[state=checked]:text-primary-container data-[state=checked]:bg-primary-container/8',
                  'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
                )}
              >
                <RSelect.ItemIndicator className="absolute left-1 flex size-4 items-center justify-center">
                  <Check className="size-3 text-primary-container" />
                </RSelect.ItemIndicator>
                <span className="pl-5">{opt.label}</span>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  )
}
