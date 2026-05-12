import { useRealtime } from '../hooks/use-analytics'

function flag(country: string | null) {
  if (!country) return '🌐'
  // ISO 3166 alpha-2 → regional indicator emoji
  if (country.length !== 2) return '🌐'
  const A = 0x1f1e6
  const codes = country.toUpperCase().split('').map((c) => A + (c.charCodeAt(0) - 65))
  return String.fromCodePoint(...codes)
}

export function RealtimePanel() {
  const { data, isLoading } = useRealtime(5000)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="surface-card border border-primary-container/30 rounded-sm p-6 lg:col-span-1">
        <div className="text-label-caps uppercase tracking-[0.2em] text-on-surface-variant text-[11px] font-bold">
          Visitantes agora
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-container" />
          </span>
          <span className="text-6xl font-bold tabular-nums text-white">
            {isLoading ? '—' : data?.activeVisitors ?? 0}
          </span>
        </div>
        <div className="mt-2 text-xs text-on-surface-variant">Atualizado a cada 5s</div>
      </div>

      <div className="surface-card border border-white/8 rounded-sm overflow-hidden lg:col-span-2">
        <div className="px-5 py-4 border-b border-white/8">
          <h3 className="text-label-caps uppercase tracking-[0.2em] text-on-surface-variant text-[11px] font-bold">
            Páginas em foco
          </h3>
        </div>
        <ul className="divide-y divide-white/5 max-h-80 overflow-auto">
          {(data?.topPaths ?? []).map((p) => (
            <li key={p.path} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-white font-medium truncate">{p.path}</span>
              <span className="text-primary-container tabular-nums font-bold">{p.count}</span>
            </li>
          ))}
          {!isLoading && (data?.topPaths ?? []).length === 0 && (
            <li className="px-5 py-8 text-center text-on-surface-variant text-sm">Ninguém no site agora.</li>
          )}
        </ul>
      </div>

      <div className="surface-card border border-white/8 rounded-sm overflow-hidden lg:col-span-3">
        <div className="px-5 py-4 border-b border-white/8">
          <h3 className="text-label-caps uppercase tracking-[0.2em] text-on-surface-variant text-[11px] font-bold">
            Sessões ativas
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02]">
            <tr className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
              <th className="text-left px-5 py-2 font-bold">Visitante</th>
              <th className="text-left px-3 py-2 font-bold">Página</th>
              <th className="text-left px-3 py-2 font-bold">Device</th>
              <th className="text-left px-3 py-2 font-bold">País</th>
              <th className="text-right px-5 py-2 font-bold">Visto há</th>
            </tr>
          </thead>
          <tbody>
            {(data?.visitors ?? []).map((v) => {
              const ago = Math.max(0, Math.round((Date.now() - new Date(v.lastSeenAt).getTime()) / 1000))
              return (
                <tr key={v.visitorId} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-2 font-mono text-xs text-on-surface-variant">{v.visitorId.slice(0, 8)}…</td>
                  <td className="px-3 py-2 text-white truncate max-w-[360px]">{v.path}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{v.deviceType ?? '—'}</td>
                  <td className="px-3 py-2">{flag(v.country)} <span className="text-on-surface-variant text-xs ml-1">{v.country ?? '—'}</span></td>
                  <td className="px-5 py-2 text-right tabular-nums text-on-surface-variant">{ago}s</td>
                </tr>
              )
            })}
            {!isLoading && (data?.visitors ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant">Sem sessões ativas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
