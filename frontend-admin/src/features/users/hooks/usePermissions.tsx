import { useMemo, type ReactNode } from 'react'
import { useMyPermissions } from '../api/use-users'

export function usePermissions() {
  const { data, isLoading, isError } = useMyPermissions()
  const set = useMemo(() => new Set(data ?? []), [data])
  // Fail-open: se a API de permissões está indisponível ou ainda carregando,
  // o admin não fica sem nada — gating é apenas defesa em profundidade,
  // o backend já valida cada endpoint.
  const ready = !isLoading && !isError && Array.isArray(data)
  return {
    isLoading,
    isError,
    ready,
    permissions: set,
    can: (feature: string, action: 'view' | 'edit') =>
      ready ? set.has(`${feature}:${action}`) : true,
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
