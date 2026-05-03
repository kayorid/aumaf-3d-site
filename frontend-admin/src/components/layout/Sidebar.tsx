import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Image as ImageIcon, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/posts', label: 'Posts', icon: FileText },
  { to: '/media', label: 'Mídia', icon: ImageIcon, disabled: true },
  { to: '/leads', label: 'Leads', icon: Users, disabled: true },
  { to: '/settings', label: 'Settings', icon: Settings, disabled: true },
]

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 flex-col border-r border-border bg-surface-50 px-3 py-6 fixed left-0 top-0 bottom-0 z-30">
      <div className="px-3 mb-8">
        <div className="font-mono text-[10px] tracking-[0.3em] text-text-tertiary uppercase">
          AUMAF 3D
        </div>
        <div className="text-sm text-text-primary font-semibold mt-1">Backoffice</div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.to} item={item} />
        ))}
      </nav>

      <div className="mt-auto px-3 text-[10px] text-text-tertiary font-mono">
        v1.0 · phase 1
      </div>
    </aside>
  )
}

function SidebarItem({ item }: { item: NavItem }) {
  const Icon = item.icon

  if (item.disabled) {
    return (
      <div
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-text-muted cursor-not-allowed"
        title="Em breve (Phase 2)"
      >
        <Icon className="size-4" />
        <span>{item.label}</span>
        <span className="ml-auto text-[10px] uppercase font-mono">soon</span>
      </div>
    )
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-200 border border-transparent',
        )
      }
    >
      <Icon className="size-4" />
      <span>{item.label}</span>
    </NavLink>
  )
}
