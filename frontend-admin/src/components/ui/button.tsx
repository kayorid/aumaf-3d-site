import { forwardRef, isValidElement, cloneElement, type ReactElement } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold uppercase tracking-[0.15em] transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-container text-on-primary glow-effect hover:bg-primary-dim hover:shadow-glow-lg',
        secondary:
          'bg-transparent text-on-surface border border-white/20 hover:border-primary-container/50 hover:text-primary-container',
        ghost:
          'text-on-surface-variant hover:text-on-surface hover:bg-surface-base normal-case tracking-normal font-medium',
        danger:
          'bg-transparent text-error border border-error/30 hover:border-error/60 hover:bg-error/5',
        outline:
          'border border-white/20 text-on-surface hover:border-primary-container/50 hover:text-primary-container',
      },
      size: {
        sm: 'h-8 rounded-sm px-3 text-[10px] tracking-[0.2em]',
        md: 'h-10 rounded-sm px-5 text-[11px]',
        lg: 'h-12 rounded-sm px-7 text-[12px]',
        icon: 'h-9 w-9 rounded-sm tracking-normal',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className)

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ children?: React.ReactNode; className?: string }>
      const wrapped = cloneElement(child, {
        ...child.props,
        className: cn(classes, child.props.className),
        children: (
          <>
            {loading ? <Loader2 className="animate-spin" /> : null}
            {child.props.children}
          </>
        ),
      })
      return (
        <Slot ref={ref} {...props}>
          {wrapped}
        </Slot>
      )
    }

    return (
      <button
        className={classes}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" /> : null}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
