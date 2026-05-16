import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ShieldCheck } from 'lucide-react'
import type { DsrStatus } from '@aumaf/shared'
import { useDsrList } from '../api/use-dsr'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DsrRequestDrawer } from '../components/DsrRequestDrawer'

const STATUS_OPTIONS: { value: '' | DsrStatus; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'pending_verification', label: 'Aguardando verificação' },
  { value: 'open', label: 'Aberto' },
  { value: 'in_progress', label: 'Em progresso' },
  { value: 'completed', label: 'Concluído' },
  { value: 'rejected', label: 'Rejeitado' },
]

const REQUEST_TYPE_LABEL: Record<string, string> = {
  access: 'Acesso',
  correction: 'Correção',
  anonymization: 'Anonimização',
  deletion: 'Eliminação',
  portability: 'Portabilidade',
  revocation: 'Revogação',
  info_share: 'Compartilhamento',
  info_no_consent: 'Não consentir',
  review_automated: 'Revisão automatizada',
}

const STATUS_LABEL: Record<DsrStatus, string> = {
  pending_verification: 'Aguardando',
  open: 'Aberto',
  in_progress: 'Em progresso',
  completed: 'Concluído',
  rejected: 'Rejeitado',
}

const STATUS_TONE: Record<DsrStatus, string> = {
  pending_verification: 'text-yellow-300 border-yellow-300/30',
  open: 'text-primary-container border-primary-container/40',
  in_progress: 'text-blue-300 border-blue-300/30',
  completed: 'text-on-surface-variant border-white/15',
  rejected: 'text-red-300 border-red-300/30',
}

function slaDaysRemaining(dto: { verifiedAt: string | null; createdAt: string; status: DsrStatus }): number | null {
  if (dto.status === 'completed' || dto.status === 'rejected') return null
  const start = dto.verifiedAt ? new Date(dto.verifiedAt) : new Date(dto.createdAt)
  const deadline = new Date(start.getTime() + 21 * 24 * 60 * 60 * 1000)
  const diff = Math.ceil((deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  return diff
}

export function LgpdRequestsPage() {
  const [status, setStatus] = useState<'' | DsrStatus>('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data, isLoading, isError } = useDsrList({
    status: status || undefined,
    page,
    pageSize: 25,
  })

  return (
    <div className="space-y-8 animate-fade-in max-w-[1400px]">
      <header className="flex items-center justify-between border-b border-white/8 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="size-4 text-primary-container" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-primary-container">LGPD</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-[-0.02em] text-white">
            Solicitações de Direitos
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Atendimento art. 18 — Lei nº 13.709/2018. Prazo: 15 dias úteis a partir da verificação.
          </p>
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as '' | DsrStatus)
            setPage(1)
          }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </header>

      {isError && (
        <div className="border border-red-400/30 text-red-300 px-4 py-3 rounded-sm bg-red-400/5">
          Falha ao carregar solicitações.
        </div>
      )}

      <div className="border border-white/8 rounded-sm overflow-hidden glass-panel">
        <table className="w-full text-sm">
          <thead className="bg-surface-high/40 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Data</th>
              <th className="text-left px-4 py-3 font-medium">E-mail</th>
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">SLA</th>
              <th className="text-right px-4 py-3 font-medium">Ação</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">
                  Carregando…
                </td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">
                  Nenhuma solicitação no filtro atual.
                </td>
              </tr>
            )}
            {data?.data.map((dto) => {
              const sla = slaDaysRemaining(dto)
              return (
                <tr
                  key={dto.id}
                  className="border-t border-white/6 hover:bg-surface-high/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedId(dto.id)}
                >
                  <td className="px-4 py-3 text-on-surface-variant tabular-nums">
                    {format(new Date(dto.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 text-white">
                    <div>{dto.email}</div>
                    {dto.fullName && <div className="text-[11px] text-on-surface-variant">{dto.fullName}</div>}
                  </td>
                  <td className="px-4 py-3 text-on-surface">
                    {REQUEST_TYPE_LABEL[dto.requestType] ?? dto.requestType}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-block text-[10px] uppercase tracking-[0.15em] border px-2 py-0.5 rounded-sm font-medium',
                        STATUS_TONE[dto.status],
                      )}
                    >
                      {STATUS_LABEL[dto.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant tabular-nums">
                    {sla === null ? '—' : sla < 0 ? (
                      <span className="text-red-300">Atrasado ({Math.abs(sla)}d)</span>
                    ) : sla <= 3 ? (
                      <span className="text-yellow-300">{sla}d</span>
                    ) : (
                      <span>{sla}d</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedId(dto.id)
                      }}
                    >
                      Abrir
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-on-surface-variant">
          <span>
            Página {data.pagination.page} de {data.pagination.totalPages} — {data.pagination.total} no total
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <DsrRequestDrawer
        requestId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}
