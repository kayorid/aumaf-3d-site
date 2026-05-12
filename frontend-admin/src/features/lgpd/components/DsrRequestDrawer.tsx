import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Download, ShieldAlert, X } from 'lucide-react'
import { useDsrDetail, useUpdateDsr, useAnonymizeDsr } from '../api/use-dsr'
import { dsrApi } from '../api/dsr.api'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { Select } from '@/components/ui/select'
import type { DsrStatus } from '@aumaf/shared'

interface Props {
  requestId: string | null
  onClose: () => void
}

const STATUS_OPTIONS: { value: DsrStatus; label: string }[] = [
  { value: 'pending_verification', label: 'Aguardando verificação' },
  { value: 'open', label: 'Aberto' },
  { value: 'in_progress', label: 'Em progresso' },
  { value: 'completed', label: 'Concluído' },
  { value: 'rejected', label: 'Rejeitado' },
]

const REQUEST_TYPE_LABEL: Record<string, string> = {
  access: 'Confirmação e acesso',
  correction: 'Correção',
  anonymization: 'Anonimização/Eliminação',
  deletion: 'Eliminação (consentimento)',
  portability: 'Portabilidade',
  revocation: 'Revogação de consentimento',
  info_share: 'Informação sobre compartilhamento',
  info_no_consent: 'Não fornecer consentimento',
  review_automated: 'Revisão de decisão automatizada',
}

export function DsrRequestDrawer({ requestId, onClose }: Props) {
  const { data, isLoading } = useDsrDetail(requestId)
  const update = useUpdateDsr()
  const anonymize = useAnonymizeDsr()
  const confirm = useConfirm()
  const [status, setStatus] = useState<DsrStatus>('open')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (data) {
      setStatus(data.status)
      setNote(data.resolutionNote ?? '')
    }
  }, [data])

  if (!requestId) return null

  async function handleSave() {
    if (!requestId) return
    await update.mutateAsync({ id: requestId, input: { status, resolutionNote: note } })
  }

  async function handleExport() {
    if (!requestId) return
    const blob = await dsrApi.exportPii(requestId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dsr-${requestId}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function handleAnonymize() {
    if (!data) return
    const ok = await confirm({
      title: 'Anonimizar dados deste titular?',
      description: `Esta ação substitui PERMANENTEMENTE nome, e-mail, telefone e mensagem de TODOS os leads associados a ${data.email} por hashes determinísticos. Não pode ser desfeita. Use somente após validar identidade.`,
      confirmLabel: 'Anonimizar',
      variant: 'danger',
    })
    if (!ok || !requestId) return
    await anonymize.mutateAsync(requestId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative w-full max-w-[540px] h-full overflow-y-auto bg-surface-base border-l border-white/10 glass-panel">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/8 sticky top-0 bg-surface-base/95 backdrop-blur-md z-10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-primary-container mb-1">
              Solicitação LGPD
            </div>
            <h2 className="text-lg font-bold uppercase tracking-[-0.02em] text-white">
              {data ? REQUEST_TYPE_LABEL[data.requestType] ?? data.requestType : '...'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border border-white/15 rounded-sm flex items-center justify-center text-on-surface-variant hover:text-white hover:border-white/30"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </header>

        {isLoading && (
          <div className="px-6 py-12 text-center text-on-surface-variant">Carregando…</div>
        )}

        {data && (
          <div className="px-6 py-6 space-y-6">
            <section>
              <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">Titular</div>
              <div className="text-white">{data.email}</div>
              {data.fullName && <div className="text-sm text-on-surface-variant">{data.fullName}</div>}
            </section>

            <section className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-1">Criada em</div>
                <div className="text-on-surface tabular-nums">
                  {format(new Date(data.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-1">Verificada em</div>
                <div className="text-on-surface tabular-nums">
                  {data.verifiedAt ? format(new Date(data.verifiedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '—'}
                </div>
              </div>
              {data.resolvedAt && (
                <div className="col-span-2">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-1">Resolvida em</div>
                  <div className="text-on-surface tabular-nums">
                    {format(new Date(data.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                </div>
              )}
            </section>

            {data.description && (
              <section>
                <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">Descrição</div>
                <p className="text-sm text-on-surface bg-surface-high/40 border border-white/8 px-4 py-3 rounded-sm whitespace-pre-wrap">
                  {data.description}
                </p>
              </section>
            )}

            <section>
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block mb-2" htmlFor="dsr-status">
                Status
              </label>
              <Select id="dsr-status" value={status} onChange={(e) => setStatus(e.target.value as DsrStatus)}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </section>

            <section>
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block mb-2" htmlFor="dsr-note">
                Nota de resolução (interna)
              </label>
              <textarea
                id="dsr-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                maxLength={4000}
                className="w-full bg-surface-high/40 border border-white/15 rounded-sm px-3 py-2 text-on-surface focus:border-primary-container focus:outline-none text-sm"
                placeholder="Descreva o que foi feito para atender ao titular…"
              />
            </section>

            <section className="border-t border-white/8 pt-5 space-y-3">
              <div className="flex gap-2">
                <Button onClick={handleSave} loading={update.isPending} className="flex-1">
                  Salvar
                </Button>
                <Button variant="ghost" onClick={handleExport}>
                  <Download className="size-4" />
                  Exportar PII (JSON)
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={handleAnonymize}
                loading={anonymize.isPending}
                className="w-full text-red-300 hover:bg-red-400/10 hover:text-red-200 border border-red-400/30"
              >
                <ShieldAlert className="size-4" />
                Anonimizar dados deste titular
              </Button>
            </section>
          </div>
        )}
      </aside>
    </div>
  )
}
