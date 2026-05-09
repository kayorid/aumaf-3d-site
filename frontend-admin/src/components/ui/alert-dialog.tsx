import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger
export const AlertDialogPortal = AlertDialogPrimitive.Portal

export const AlertDialogOverlay = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm', className)}
    {...props}
  />
))
AlertDialogOverlay.displayName = 'AlertDialogOverlay'

export const AlertDialogContent = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2',
        'w-[92vw] max-w-md bg-surface-low border border-white/10 rounded-sm shadow-2xl',
        'p-6 space-y-4',
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = 'AlertDialogContent'

export const AlertDialogTitle = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('text-[14px] font-bold uppercase tracking-[-0.01em] text-white', className)}
    {...props}
  />
))
AlertDialogTitle.displayName = 'AlertDialogTitle'

export const AlertDialogDescription = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn('text-[13px] text-on-surface-variant leading-relaxed', className)}
    {...props}
  />
))
AlertDialogDescription.displayName = 'AlertDialogDescription'

export function AlertDialogActions({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 pt-2">{children}</div>
}

export const AlertDialogCancel = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Cancel>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ children, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel ref={ref} asChild {...props}>
    <Button variant="ghost" size="md">
      {children}
    </Button>
  </AlertDialogPrimitive.Cancel>
))
AlertDialogCancel.displayName = 'AlertDialogCancel'

export const AlertDialogAction = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Action>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> & { variant?: 'primary' | 'danger' }
>(({ children, variant = 'danger', ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} asChild {...props}>
    <Button variant={variant} size="md">
      {children}
    </Button>
  </AlertDialogPrimitive.Action>
))
AlertDialogAction.displayName = 'AlertDialogAction'
