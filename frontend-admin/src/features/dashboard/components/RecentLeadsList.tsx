import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { LeadMaskedDto } from '@aumaf/shared'

interface Props {
  leads: LeadMaskedDto[]
  loading?: boolean
}

export function RecentLeadsList({ leads, loading }: Props) {
  return (
    <div className="bg-surface-low/60 border border-white/10 rounded-sm">
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-primary-container/80 tracking-[0.2em]">/ B</span>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface">
            Últimos leads
          </h3>
        </div>
        <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-on-surface-variant/70">
          últimos 30 dias
        </span>
      </header>

      <div className="p-5 pt-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-white/8">
            {leads.map((lead) => (
              <li key={lead.id} className="py-3 flex items-center gap-3">
                <div className="size-8 border border-primary-container/40 bg-primary-container/10 text-primary-container flex items-center justify-center text-[11px] font-bold uppercase">
                  {lead.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-on-surface truncate">
                    {lead.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/70 mt-0.5 font-mono truncate">
                    {lead.contactMasked}
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  {lead.source && <Badge variant="info">{lead.source}</Badge>}
                  <div
                    className="text-[9px] font-mono uppercase tracking-[0.2em] text-on-surface-variant/60"
                    title={format(new Date(lead.createdAt), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                  >
                    {formatDistanceToNow(new Date(lead.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div className="flex flex-col items-center text-center py-10 gap-3">
      <div className="size-10 border border-white/15 text-on-surface-variant flex items-center justify-center">
        <Users className="size-4" />
      </div>
      <div className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">
        Sem leads recentes
      </div>
      <div className="text-[10px] text-on-surface-variant/70 max-w-xs leading-relaxed">
        Quando o formulário do site receber dados, aparecem aqui.
      </div>
    </div>
  )
}
