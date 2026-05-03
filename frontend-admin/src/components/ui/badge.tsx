import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] border whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'border-white/20 text-on-surface-variant bg-transparent',
        primary: 'border-primary-container/50 text-primary-container bg-transparent',
        active: 'border-primary-container bg-primary-container text-on-primary',
        success: 'border-primary-container/50 text-primary-container bg-primary-container/5',
        warn: 'border-yellow-400/40 text-yellow-300 bg-yellow-400/5',
        info: 'border-blue-400/40 text-blue-300 bg-blue-400/5',
        danger: 'border-error/40 text-error bg-error/5',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
