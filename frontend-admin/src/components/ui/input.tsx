import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-md border border-border bg-surface-100 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus-ring disabled:cursor-not-allowed disabled:opacity-50',
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
      'flex min-h-[80px] w-full rounded-md border border-border bg-surface-100 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
