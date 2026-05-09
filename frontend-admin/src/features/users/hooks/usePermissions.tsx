import { useMemo, type ReactNode } from 'react'
import { useMyPermissions } from '../api/use-users'

export function usePermissions() {
  const { data, isLoading } = useMyPermissions()
  const set = useMemo(() => new Set(data ?? []), [data])
  return {
    isLoading,
    permissions: set,
    can: (feature: string, action: 'view' | 'edit') => set.has(`${feature}:${action}`),
  }
}

interface RequirePermissionProps {
  feature: string
  action: 'view' | 'edit'
  children: ReactNode
  fallback?: ReactNode
}

export function RequirePermission({ feature, action, children, fallback = null }: RequirePermissionProps) {
  const { can, isLoading } = usePermissions()
  if (isLoading) return null
  return can(feature, action) ? <>{children}</> : <>{fallback}</>
}
