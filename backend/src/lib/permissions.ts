// Modelo de permissões: feature × action.
// Roles funcionam como presets; UserPermission contém overrides (granted=true adiciona,
// granted=false revoga em relação ao preset).
import type { UserRole } from '@aumaf/shared'

export const FEATURES = [
  'dashboard',
  'posts',
  'categories',
  'leads',
  'analytics',
  'media',
  'settings',
  'botyio',
  'users',
  'lgpd',
] as const

export const ACTIONS = ['view', 'edit'] as const

export type Feature = (typeof FEATURES)[number]
export type Action = (typeof ACTIONS)[number]
export type Permission = `${Feature}:${Action}`

export interface PermissionRecord {
  feature: string
  action: string
  granted: boolean
}

const ALL_FEATURES_EDIT: Permission[] = FEATURES.map((f) => `${f}:edit` as Permission)

export const ROLE_PRESETS: Record<UserRole, Permission[]> = {
  ADMIN: ALL_FEATURES_EDIT,
  EDITOR: [
    'dashboard:view',
    'posts:edit',
    'categories:edit',
    'media:edit',
  ],
  MARKETING: [
    'dashboard:view',
    'posts:view',
    'categories:view',
    'leads:edit',
    'analytics:view',
    'media:view',
    'botyio:view',
  ],
}

/**
 * Resolve as permissões efetivas de um usuário combinando o preset do role
 * com overrides individuais. `edit` sempre implica `view`.
 */
export function resolvePermissions(role: UserRole, overrides: PermissionRecord[] = []): Set<Permission> {
  const set = new Set<Permission>(ROLE_PRESETS[role] ?? [])

  for (const o of overrides) {
    const key = `${o.feature}:${o.action}` as Permission
    if (!isValidPermission(key)) continue
    if (o.granted) set.add(key)
    else set.delete(key)
  }

  // edit implica view
  for (const key of [...set]) {
    if (key.endsWith(':edit')) {
      const view = key.replace(':edit', ':view') as Permission
      set.add(view)
    }
  }

  return set
}

export function isValidPermission(p: string): p is Permission {
  const [feature, action] = p.split(':')
  return (
    FEATURES.includes(feature as Feature) &&
    ACTIONS.includes(action as Action)
  )
}

export function permissionCatalog() {
  return {
    features: FEATURES.map((f) => ({ id: f, label: featureLabel(f) })),
    actions: ACTIONS,
    rolePresets: ROLE_PRESETS,
  }
}

function featureLabel(f: Feature): string {
  const map: Record<Feature, string> = {
    dashboard: 'Dashboard',
    posts: 'Posts',
    categories: 'Categorias',
    leads: 'Leads',
    analytics: 'Analytics',
    media: 'Mídia',
    settings: 'Configurações',
    botyio: 'Botyio',
    users: 'Usuários',
    lgpd: 'LGPD',
  }
  return map[f]
}
