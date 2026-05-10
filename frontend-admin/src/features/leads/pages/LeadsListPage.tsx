import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Download, Mail, MessageCircle, Phone, Search, Trash2, Users, X } from 'lucide-react'
import type { LeadFilterQuery } from '@template/shared'
import { useLeads, useLeadSources, useBulkDeleteLeads } from '../api/use-leads'
import { leadsApi } from '../api/leads.api'
import { LeadDrawer } from '../components/LeadDrawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'

export function LeadsListPage() {
  const [filters, setFilters] = useState<Partial<LeadFilterQuery>>({ page: 1, pageSize: 20 })
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { data, isLoading, isError, error } = useLeads(filters)
  const sources = useLeadSources()
  const bulkDelete = useBulkDeleteLeads()
  const confirm = useConfirm()

  const visibleIds = useMemo(() => data?.data.map((l) => l.id) ?? [], [data])
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))
  const someSelected = !allSelected && visibleIds.some((id) => selectedIds.has(id))
  const selectedCount = selectedIds.size

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        visibleIds.forEach((id) => next.delete(id))
      } else {
        visibleIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  const BULK_LIMIT = 100

  async function handleBulkDelete() {
    const count = selectedIds.size
    if (count === 0) return
    if (count > BULK_LIMIT) {
      await confirm({
        title: 'Limite por operação atingido',
        description: `Máximo ${BULK_LIMIT} leads por exclusão. Você selecionou ${count} — desmarque alguns e tente novamente.`,
        confirmLabel: 'Entendi',
        variant: 'primary',
        hideCancel: true,
      })
      return
    }
    const ok = await confirm({
      title: `Excluir ${count} lead(s)?`,
      description: `Esta ação não pode ser desfeita. Os dados ficam preservados no banco como soft-delete, mas saem da listagem.`,
      confirmLabel: `Excluir ${count}`,
      variant: 'danger',
    })
    if (!ok) return
    try {
      await bulkDelete.mutateAsync(Array.from(selectedIds))
      clearSelection()
    } catch {
      // toast já tratado no hook
    }
  }

  const update = (patch: Partial<LeadFilterQuery>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }))
    clearSelection()
  }

  const clear = () => setFilters({ page: 1, pageSize: 20 })

  const handleExport = async () => {
    const url = await leadsApi.exportCsvUrl(filters)
    // Browser baixa via window.open (cookie httpOnly viaja junto)
    window.open(url, '_blank')
  }

  const hasActiveFilters = !!(filters.from || filters.to || filters.source || filters.q)

  return (
    <div className="space-y-8 animate-fade-in max-w-[1400px]">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">/ 04</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Pipeline</span>
          </div>
          <h1 className="text-[clamp(28px,3vw,40px)] font-bold text-white uppercase leading-none tracking-[-0.03em]">
            Leads <span className="text-gradient-green">recebidos.</span>
          </h1>
          <p className="text-[13px] text-on-surface-variant max-w-md leading-relaxed">
            Captados pelo formulário de contato — total {data?.pagination.total ?? '—'} no período.
          </p>
        </div>
        <Button onClick={handleExport} size="md" variant="secondary" disabled={!data || data.pagination.total === 0}>
          <Download className="size-3.5" />
          Exportar CSV
        </Button>
      </header>

      <div className="bg-surface-low/60 border border-white/10 rounded-sm p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70 block mb-1.5">Buscar</label>
            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
              <Input
                placeholder="Nome, email ou trecho da mensagem"
                className="pl-9"
                value={filters.q ?? ''}
                onChange={(e) => update({ q: e.target.value || undefined })}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70 block mb-1.5">Fonte</label>
            <Select
              value={filters.source ?? ''}
              onChange={(e) => update({ source: e.target.value || undefined })}
            >
              <option value="">Todas</option>
              {sources.data?.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70 block mb-1.5">De</label>
              <Input
                type="date"
                value={filters.from ? new Date(filters.from).toISOString().slice(0, 10) : ''}
                onChange={(e) => update({ from: e.target.value ? new Date(e.target.value) : undefined })}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70 block mb-1.5">Até</label>
              <Input
                type="date"
                value={filters.to ? new Date(filters.to).toISOString().slice(0, 10) : ''}
                onChange={(e) => update({ to: e.target.value ? new Date(e.target.value) : undefined })}
              />
            </div>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clear}
            className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary-container transition-colors flex items-center gap-1.5"
          >
            <X className="size-3" /> Limpar filtros
          </button>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="sticky top-2 z-30 flex items-center justify-between gap-3 px-4 py-2.5 rounded-sm border border-primary-container/40 bg-black/80 backdrop-blur shadow-[0_0_30px_rgba(97,197,79,0.15)]">
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-[0.2em] text-primary-container">
              {selectedCount} selecionado(s)
              {(() => {
                const onPage = visibleIds.filter((id) => selectedIds.has(id)).length
                const offPage = selectedCount - onPage
                return offPage > 0 ? (
                  <span className="ml-2 text-on-surface-variant/80 normal-case tracking-normal text-[10px]">
                    ({onPage} nesta página + {offPage} em outras)
                  </span>
                ) : null
              })()}
            </span>
            <button
              onClick={clearSelection}
              className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface flex items-center gap-1"
              type="button"
            >
              <X className="size-3" /> Limpar seleção
            </button>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={handleBulkDelete}
            loading={bulkDelete.isPending}
          >
            <Trash2 className="size-3.5" /> Excluir selecionados
          </Button>
        </div>
      )}

      <div className="bg-surface-low/60 border border-white/10 rounded-sm overflow-hidden">
        {isError && <div className="p-6 text-sm text-error">Erro: {(error as Error).message}</div>}

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/10 mb-4">
              <Users className="size-5 text-on-surface-variant" />
            </div>
            <p className="text-sm text-on-surface-variant">
              {hasActiveFilters ? 'Nenhum lead corresponde aos filtros aplicados.' : 'Nenhum lead recebido ainda.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-surface-dim/50">
                <tr className="text-on-surface-variant/70 text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      aria-label="Selecionar todos"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected
                      }}
                      onChange={toggleAllVisible}
                      className={cn(
                        'size-4 rounded-sm border border-white/20 bg-black accent-primary-container cursor-pointer',
                        'focus:outline-none focus:ring-1 focus:ring-primary-container/40',
                      )}
                    />
                  </th>
                  <th className="text-left px-6 py-3">Nome</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Contato</th>
                  <th className="text-left px-6 py-3 hidden lg:table-cell">Fonte</th>
                  <th className="text-left px-6 py-3 hidden lg:table-cell">Recebido</th>
                  <th className="text-right px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((lead) => (
                  <tr
                    key={lead.id}
                    className={cn(
                      'border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer',
                      selectedIds.has(lead.id) && 'bg-primary-container/5',
                    )}
                    onClick={() => setSelectedLeadId(lead.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedLeadId(lead.id)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Abrir detalhes do lead ${lead.name}`}
                  >
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Selecionar lead ${lead.name}`}
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleOne(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="size-4 rounded-sm border border-white/20 bg-black accent-primary-container cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-container/40"
                      />
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-on-surface">{lead.name}</div>
                      {lead.message && (
                        <div className="text-[11px] text-on-surface-variant/70 mt-0.5 line-clamp-1 max-w-md">
                          {lead.message}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5 hidden md:table-cell">
                      <div className="space-y-1">
                        <a
                          href={`mailto:${lead.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[12px] text-on-surface-variant hover:text-primary-container transition-colors flex items-center gap-1.5"
                        >
                          <Mail className="size-3" /> {lead.email}
                        </a>
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[12px] text-on-surface-variant hover:text-primary-container transition-colors flex items-center gap-1.5"
                          >
                            <Phone className="size-3" /> {lead.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 hidden lg:table-cell">
                      {lead.source ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-white/15 text-[10px] uppercase tracking-widest text-on-surface-variant">
                          {lead.source}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant/40 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-on-surface-variant/80 hidden lg:table-cell text-[12px]">
                      {format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] text-primary-container hover:underline"
                        >
                          <MessageCircle className="size-3" /> WhatsApp
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="border-t border-white/10 px-6 py-3 flex items-center justify-between text-[11px] text-on-surface-variant/80">
            <span>
              Página {data.pagination.page} de {data.pagination.totalPages} · {data.pagination.total} leads
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={data.pagination.page === 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={data.pagination.page >= data.pagination.totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      <LeadDrawer leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
    </div>
  )
}
