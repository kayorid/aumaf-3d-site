import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-sm border border-white/15 bg-surface-dim px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant placeholder:text-xs focus:outline-none focus:border-primary-container/60 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full rounded-sm border border-white/15 bg-surface-dim px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-container/60 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
