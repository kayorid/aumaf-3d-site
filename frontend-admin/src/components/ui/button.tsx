import { forwardRef, isValidElement, cloneElement, type ReactElement } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-background hover:bg-primary-400',
        secondary: 'bg-surface-200 text-text-primary border border-border hover:bg-surface-300',
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-200',
        danger: 'bg-danger-500 text-white hover:bg-danger-600',
        outline: 'border border-border-strong text-text-primary hover:bg-surface-200',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-10 rounded-md px-4 text-sm',
        lg: 'h-12 rounded-lg px-6 text-base',
        icon: 'h-9 w-9 rounded-md',
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
