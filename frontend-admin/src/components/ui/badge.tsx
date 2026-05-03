import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-200 text-text-secondary border-border',
        primary: 'bg-primary-500/10 text-primary-400 border-primary-500/30',
        warn: 'bg-warn-500/10 text-warn-400 border-warn-500/30',
        info: 'bg-info-500/10 text-info-400 border-info-500/30',
        danger: 'bg-danger-500/10 text-danger-400 border-danger-500/30',
        success: 'bg-primary-500/10 text-primary-300 border-primary-500/30',
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
