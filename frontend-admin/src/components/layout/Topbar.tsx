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
    <header className="sticky top-0 z-20 nav-glass border-b border-white/10">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="lg:hidden flex items-center gap-1">
          <span className="font-pirulen text-[14px] text-white tracking-[0.06em]">AUMAF</span>
          <span className="font-pirulen text-[14px] text-primary-container tracking-[0.06em]">3D</span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* Status pill mini */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container dot-glow animate-pulse-dot" />
            <span className="text-[9px] uppercase tracking-[0.25em] text-on-surface-variant">
              Online
            </span>
          </div>

          {/* User dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              className={cn(
                'group flex items-center gap-2.5 pl-2 pr-3 h-9 border border-white/15 rounded-sm',
                'hover:border-primary-container/40 transition-colors focus-ring',
              )}
            >
              <div className="flex items-center justify-center size-6 rounded-sm bg-primary-container/15 text-primary-container text-[10px] font-bold uppercase">
                {user?.name?.[0] ?? '?'}
              </div>
              <span className="hidden sm:inline text-[11px] uppercase tracking-[0.15em] text-on-surface font-medium">
                {user?.name?.split(' ')[0] ?? '—'}
              </span>
              <ChevronDown className="size-3 text-on-surface-variant group-hover:text-on-surface transition-colors" />
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="min-w-[220px] glass-panel-strong rounded-sm p-1 shadow-glass animate-fade-in z-50"
              >
                <div className="px-3 py-3 border-b border-white/10 mb-1">
                  <div className="text-[11px] uppercase tracking-[0.15em] text-on-surface font-bold">
                    {user?.name}
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-1 truncate">
                    {user?.email}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 border border-primary-container/40 px-2 py-0.5 text-[9px] uppercase font-bold tracking-[0.2em] text-primary-container">
                    {user?.role}
                  </div>
                </div>
                <DropdownMenu.Item
                  onSelect={() => navigate('/perfil')}
                  className="flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-on-surface-variant hover:bg-white/5 hover:text-on-surface cursor-pointer focus:outline-none focus:bg-white/5"
                >
                  <User className="size-3.5" /> Perfil
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-on-surface-variant hover:bg-white/5 hover:text-on-surface cursor-pointer focus:outline-none focus:bg-white/5"
                >
                  <LogOut className="size-3.5" /> Sair
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}
