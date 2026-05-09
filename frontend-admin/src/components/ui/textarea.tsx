import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full min-h-[80px] resize-y bg-surface-base border border-white/10 rounded-sm px-3 py-2',
        'text-[13px] text-on-surface placeholder:text-on-surface-variant/40',
        'focus:outline-none focus:border-primary-container/60 focus-ring',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
