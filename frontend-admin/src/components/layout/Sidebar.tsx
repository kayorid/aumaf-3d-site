import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Image as ImageIcon, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  number: string
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, number: '01' },
  { to: '/posts',     label: 'Posts',     icon: FileText,        number: '02' },
  { to: '/media',     label: 'Mídia',     icon: ImageIcon,       number: '03', disabled: true },
  { to: '/leads',     label: 'Leads',     icon: Users,           number: '04', disabled: true },
  { to: '/settings',  label: 'Settings',  icon: Settings,        number: '05', disabled: true },
]

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 flex-col fixed left-0 top-0 bottom-0 z-30 nav-glass border-r border-white/10">
      {/* Logo block */}
      <div className="px-6 pt-7 pb-8">
        <div className="flex items-center gap-1">
          <span className="font-pirulen text-[16px] text-white tracking-[0.06em] leading-none">
            AUMAF
          </span>
          <span className="font-pirulen text-[16px] text-primary-container tracking-[0.06em] leading-none">
            3D
          </span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mt-2">
          Backoffice
        </div>
      </div>

      {/* Sistema online indicator */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container dot-glow animate-pulse-dot" />
          <span className="text-[9px] uppercase tracking-[0.25em] text-primary-container/90">
            Sistema online
          </span>
        </div>
      </div>

      {/* Section label */}
      <div className="px-6 mb-3">
        <div className="text-[9px] uppercase tracking-[0.25em] text-on-surface-variant/60 font-bold">
          Navegação
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col px-3" aria-label="Principal">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.to} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-6 pb-6 pt-6 border-t border-white/8">
        <div className="text-[9px] uppercase tracking-[0.25em] text-on-surface-variant/70 mb-1">
          v1.0 · Phase 1
        </div>
        <div className="text-[10px] text-on-surface-variant/50">
          build by <span className="text-on-surface-variant/80">kayoridolfi.ai</span>
        </div>
      </div>
    </aside>
  )
}

function SidebarItem({ item }: { item: NavItem }) {
  const Icon = item.icon

  if (item.disabled) {
    return (
      <div
        className="group relative flex items-center gap-3 px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-on-surface-variant/30 cursor-not-allowed"
        title="Em breve (Phase 2)"
      >
        <span className="text-[9px] font-mono text-on-surface-variant/30 w-4">{item.number}</span>
        <Icon className="size-3.5 shrink-0" />
        <span className="font-medium">{item.label}</span>
        <span className="ml-auto text-[8px] uppercase tracking-[0.2em] text-on-surface-variant/30">
          soon
        </span>
      </div>
    )
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] transition-all',
          isActive
            ? 'text-primary-container'
            : 'text-on-surface-variant hover:text-on-surface',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Accent line vertical no item ativo */}
          {isActive && (
            <span
              aria-hidden
              className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-px bg-primary-container"
              style={{ boxShadow: '0 0 6px rgba(97,197,79,0.6)' }}
            />
          )}
          <span
            className={cn(
              'text-[9px] font-mono w-4 transition-colors',
              isActive ? 'text-primary-container' : 'text-on-surface-variant/40 group-hover:text-on-surface-variant/70',
            )}
          >
            {item.number}
          </span>
          <Icon className="size-3.5 shrink-0" />
          <span className="font-medium">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}
