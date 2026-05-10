import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogActions,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from './alert-dialog'

export interface ConfirmOptions {
  title?: ReactNode
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  hideCancel?: boolean
}

interface ConfirmCtx {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
}

const Ctx = createContext<ConfirmCtx | null>(null)

interface State extends ConfirmOptions {
  open: boolean
}

const DEFAULT_STATE: State = { open: false }

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(DEFAULT_STATE)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const close = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, open: false }))
    if (resolverRef.current) {
      resolverRef.current(value)
      resolverRef.current = null
    }
  }, [])

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve, reject) => {
      if (resolverRef.current) {
        reject(new Error('Outro diálogo de confirmação já está aberto'))
        return
      }
      resolverRef.current = resolve
      setState({ open: true, variant: 'danger', ...opts })
    })
  }, [])

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <Ctx.Provider value={value}>
      {children}
      <AlertDialog
        open={state.open}
        onOpenChange={(o) => {
          if (!o) close(false)
        }}
      >
        <AlertDialogContent>
          {state.title && <AlertDialogTitle>{state.title}</AlertDialogTitle>}
          {state.description && <AlertDialogDescription>{state.description}</AlertDialogDescription>}
          <AlertDialogActions>
            {!state.hideCancel && (
              <AlertDialogCancel onClick={() => close(false)}>
                {state.cancelLabel ?? 'Cancelar'}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              variant={state.variant ?? 'danger'}
              onClick={() => close(true)}
            >
              {state.confirmLabel ?? 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogActions>
        </AlertDialogContent>
      </AlertDialog>
    </Ctx.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useConfirm must be used within <ConfirmProvider>')
  return ctx.confirm
}
