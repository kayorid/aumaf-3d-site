import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const Drawer = DialogPrimitive.Root
export const DrawerTrigger = DialogPrimitive.Trigger
export const DrawerClose = DialogPrimitive.Close
export const DrawerPortal = DialogPrimitive.Portal

export const DrawerOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
      className,
    )}
    {...props}
  />
))
DrawerOverlay.displayName = 'DrawerOverlay'

interface DrawerContentProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  width?: string
}

export const DrawerContent = forwardRef<ElementRef<typeof DialogPrimitive.Content>, DrawerContentProps>(
  ({ className, children, width = 'w-full sm:w-[480px] md:w-[560px]', ...props }, ref) => (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex flex-col',
          width,
          'bg-surface-low border-l border-white/10 shadow-2xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'duration-300',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DrawerPortal>
  ),
)
DrawerContent.displayName = 'DrawerContent'

interface DrawerHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

export function DrawerHeader({ title, subtitle, actions }: DrawerHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-surface-low/95 backdrop-blur-sm border-b border-white/10 px-6 py-5 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <DialogPrimitive.Title className="text-[15px] font-bold text-white uppercase tracking-[-0.01em] leading-tight">
          {title}
        </DialogPrimitive.Title>
        {subtitle && <div className="text-[12px] text-on-surface-variant mt-0.5">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {actions}
        <DrawerClose
          className="p-1.5 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 focus-ring"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </DrawerClose>
      </div>
    </div>
  )
}

export function DrawerBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex-1 overflow-y-auto px-6 py-5 space-y-6', className)}>{children}</div>
}
