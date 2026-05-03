import { useNavigate } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { LogOut, ChevronDown, User } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useLogout } from '@/features/auth/api/use-logout'
import { cn } from '@/lib/utils'

export function Topbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur px-6">
      <div className="lg:hidden font-mono text-xs tracking-[0.3em] text-text-tertiary uppercase">
        AUMAF 3D
      </div>

      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            className={cn(
              'flex items-center gap-2 rounded-md border border-border bg-surface-100 px-3 py-1.5 text-sm text-text-primary',
              'hover:bg-surface-200 focus-ring',
            )}
          >
            <div className="flex items-center justify-center size-6 rounded-full bg-primary-500/20 text-primary-400 text-xs font-semibold uppercase">
              {user?.name?.[0] ?? '?'}
            </div>
            <span className="hidden sm:inline">{user?.name ?? '—'}</span>
            <ChevronDown className="size-3.5 text-text-tertiary" />
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="min-w-[200px] rounded-md border border-border bg-surface-100 p-1 shadow-xl animate-fade-in z-50"
            >
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-text-primary">{user?.name}</div>
                <div className="text-xs text-text-tertiary">{user?.email}</div>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary-500/10 border border-primary-500/30 px-2 py-0.5 text-[10px] uppercase font-mono text-primary-400">
                  {user?.role}
                </div>
              </div>
              <DropdownMenu.Separator className="h-px bg-border my-1" />
              <DropdownMenu.Item
                disabled
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-text-muted cursor-not-allowed"
              >
                <User className="size-4" /> Perfil (em breve)
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={handleLogout}
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-text-secondary hover:bg-surface-200 hover:text-text-primary cursor-pointer focus:outline-none"
              >
                <LogOut className="size-4" /> Sair
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
