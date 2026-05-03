import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Users } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LeadMaskedDto } from '@aumaf/shared'

interface Props {
  leads: LeadMaskedDto[]
  loading?: boolean
}

export function RecentLeadsList({ leads, loading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos leads</CardTitle>
        <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">
          últimos 30 dias
        </span>
      </CardHeader>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-surface-200 animate-pulse" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <Empty />
      ) : (
        <ul className="divide-y divide-border">
          {leads.map((lead) => (
            <li key={lead.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
              <div className="size-8 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center text-xs font-semibold uppercase">
                {lead.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text-primary truncate">{lead.name}</div>
                <div className="text-xs text-text-tertiary mt-0.5 font-mono truncate">
                  {lead.contactMasked}
                </div>
              </div>
              <div className="text-right shrink-0">
                {lead.source && (
                  <Badge variant="info" className="mb-1">
                    {lead.source}
                  </Badge>
                )}
                <div
                  className="text-[10px] text-text-tertiary"
                  title={format(new Date(lead.createdAt), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                >
                  {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: ptBR })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function Empty() {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-3">
      <div className="size-10 rounded-md bg-surface-200 text-text-tertiary flex items-center justify-center">
        <Users className="size-5" />
      </div>
      <div className="text-sm text-text-secondary">Nenhum lead nos últimos 30 dias</div>
      <div className="text-xs text-text-tertiary max-w-xs">
        Quando o formulário de contato do site receber dados, eles aparecerão aqui.
      </div>
    </div>
  )
}
