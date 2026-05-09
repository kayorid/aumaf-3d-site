import { useState, useEffect } from 'react'
import { Loader2, Save, RotateCcw } from 'lucide-react'
import type {
  UserDetailDto,
  PermissionOverride,
  UserRole,
  PermissionCatalog,
} from '@aumaf/shared'
import { Button } from '@/components/ui/button'
import { usePermissionCatalog, useSetUserPermissions } from '../api/use-users'

interface Props {
  user: UserDetailDto
}

type CellState = 'preset-on' | 'preset-off' | 'override-on' | 'override-off'

export function UserPermissionsMatrix({ user }: Props) {
  const { data: catalog, isLoading } = usePermissionCatalog()
  const save = useSetUserPermissions()

  const [overrides, setOverrides] = useState<PermissionOverride[]>(user.permissions)

  useEffect(() => {
    setOverrides(user.permissions)
  }, [user.permissions])

  if (isLoading || !catalog) {
    return <div className="h-32 bg-white/5 animate-pulse rounded-sm" />
  }

  const dirty = !samePermissions(user.permissions, overrides)

  return (
    <div className="space-y-4">
      <Legend />
      <div className="overflow-x-auto bg-surface-base/40 border border-white/10 rounded-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-on-surface-variant/70 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-white/10">
              <th className="text-left px-4 py-3">Feature</th>
              <th className="text-center px-4 py-3 w-32">Visualizar</th>
              <th className="text-center px-4 py-3 w-32">Editar</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Origem</th>
            </tr>
          </thead>
          <tbody>
            {catalog.features.map((f) => (
              <FeatureRow
                key={f.id}
                featureId={f.id}
                featureLabel={f.label}
                role={user.role}
                catalog={catalog}
                overrides={overrides}
                onToggle={(action, granted) =>
                  setOverrides((prev) => toggleOverride(prev, f.id, action, granted, catalog, user.role))
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="md"
          onClick={() => setOverrides(user.permissions)}
          disabled={!dirty || save.isPending}
        >
          <RotateCcw className="size-3.5" /> Descartar
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={() => save.mutate({ id: user.id, permissions: overrides })}
          disabled={!dirty || save.isPending}
        >
          {save.isPending ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3.5" />}
          Salvar permissões
        </Button>
      </div>
    </div>
  )
}

function FeatureRow({
  featureId,
  featureLabel,
  role,
  catalog,
  overrides,
  onToggle,
}: {
  featureId: string
  featureLabel: string
  role: UserRole
  catalog: PermissionCatalog
  overrides: PermissionOverride[]
  onToggle: (action: 'view' | 'edit', granted: boolean) => void
}) {
  const viewState = stateOf(featureId, 'view', role, catalog, overrides)
  const editState = stateOf(featureId, 'edit', role, catalog, overrides)
  const origin = describeOrigin(featureId, role, catalog, overrides)

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
      <td className="px-4 py-3 font-medium text-on-surface">{featureLabel}</td>
      <td className="px-4 py-3 text-center">
        <Cell
          state={viewState}
          onClick={(currentlyOn) => onToggle('view', !currentlyOn)}
        />
      </td>
      <td className="px-4 py-3 text-center">
        <Cell
          state={editState}
          onClick={(currentlyOn) => onToggle('edit', !currentlyOn)}
        />
      </td>
      <td className="px-4 py-3 text-[11px] text-on-surface-variant hidden md:table-cell">{origin}</td>
    </tr>
  )
}

function Cell({ state, onClick }: { state: CellState; onClick: (currentlyOn: boolean) => void }) {
  const on = state === 'preset-on' || state === 'override-on'
  const cls = {
    'preset-on': 'border-on-surface-variant/40 bg-on-surface-variant/5 text-on-surface',
    'preset-off': 'border-white/10 text-on-surface-variant/30',
    'override-on': 'border-primary-container/60 bg-primary-container/15 text-primary-container shadow-glow-sm',
    'override-off': 'border-error/40 bg-error/5 text-error',
  }[state]
  const label = {
    'preset-on': '✓',
    'preset-off': '·',
    'override-on': '✓',
    'override-off': '✕',
  }[state]
  return (
    <button
      type="button"
      onClick={() => onClick(on)}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-sm border-2 text-[12px] font-bold transition-all hover:scale-105 focus-ring ${cls}`}
      aria-label={state}
      title={titleFor(state)}
    >
      {label}
    </button>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
      <LegendChip cls="border-on-surface-variant/40 bg-on-surface-variant/5">Herdado do papel</LegendChip>
      <LegendChip cls="border-primary-container/60 bg-primary-container/15 text-primary-container">Concedido extra</LegendChip>
      <LegendChip cls="border-error/40 bg-error/5 text-error">Revogado</LegendChip>
      <span className="ml-auto">Edit implica View automaticamente.</span>
    </div>
  )
}

function LegendChip({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border ${cls}`}>{children}</span>
}

function titleFor(state: CellState): string {
  switch (state) {
    case 'preset-on':
      return 'Permissão herdada do papel'
    case 'preset-off':
      return 'Sem permissão'
    case 'override-on':
      return 'Permissão adicionada manualmente'
    case 'override-off':
      return 'Permissão revogada manualmente'
  }
}

function stateOf(
  feature: string,
  action: 'view' | 'edit',
  role: UserRole,
  catalog: PermissionCatalog,
  overrides: PermissionOverride[],
): CellState {
  const preset = catalog.rolePresets[role] ?? []
  const presetSet = expandImplies(new Set(preset))
  const fromPreset = presetSet.has(`${feature}:${action}`)
  const ov = overrides.find((o) => o.feature === feature && o.action === action)

  if (ov && ov.granted && !fromPreset) return 'override-on'
  if (ov && !ov.granted && fromPreset) return 'override-off'
  if (fromPreset) return 'preset-on'
  return 'preset-off'
}

function describeOrigin(
  feature: string,
  role: UserRole,
  catalog: PermissionCatalog,
  overrides: PermissionOverride[],
): string {
  const preset = catalog.rolePresets[role] ?? []
  const has = preset.some((p) => p.startsWith(`${feature}:`))
  const ov = overrides.filter((o) => o.feature === feature)
  if (ov.length > 0) return `Override (${ov.map((o) => `${o.action}=${o.granted ? '+' : '−'}`).join(', ')})`
  return has ? `Preset ${role}` : '—'
}

function expandImplies(set: Set<string>): Set<string> {
  const out = new Set(set)
  for (const k of set) if (k.endsWith(':edit')) out.add(k.replace(':edit', ':view'))
  return out
}

function toggleOverride(
  current: PermissionOverride[],
  feature: string,
  action: 'view' | 'edit',
  granted: boolean,
  catalog: PermissionCatalog,
  role: UserRole,
): PermissionOverride[] {
  const preset = expandImplies(new Set(catalog.rolePresets[role] ?? []))
  const fromPreset = preset.has(`${feature}:${action}`)
  const filtered = current.filter((o) => !(o.feature === feature && o.action === action))

  // Se o estado pretendido já é o do preset, não precisa de override
  if (granted === fromPreset) return filtered

  return [...filtered, { feature, action, granted }]
}

function samePermissions(a: PermissionOverride[], b: PermissionOverride[]): boolean {
  if (a.length !== b.length) return false
  const sortKey = (p: PermissionOverride) => `${p.feature}:${p.action}:${p.granted}`
  const aSet = new Set(a.map(sortKey))
  return b.every((p) => aSet.has(sortKey(p)))
}
