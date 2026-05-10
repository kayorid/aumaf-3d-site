import { Inbox } from 'lucide-react'
import type { BotyioDeliveryDto } from '@template/shared'

export interface DeliveriesTableProps {
  rows: BotyioDeliveryDto[]
  isLoading?: boolean
}

const EVENT_LABEL: Record<string, string> = {
  'lead.registered': 'Lead registrado',
  'whatsapp.queued': 'WhatsApp na fila',
  'whatsapp.sent': 'WhatsApp enviado',
  'whatsapp.delivered': 'WhatsApp entregue',
  'whatsapp.read': 'WhatsApp lido',
  'whatsapp.failed': 'WhatsApp falhou',
  'lead.failed': 'Lead falhou',
}

export function DeliveriesTable({ rows, isLoading }: DeliveriesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-sm border border-white/10 bg-surface-low/40 p-6 text-center text-[12px] text-on-surface-variant">
        Carregando entregas…
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-sm border border-white/10 bg-surface-low/40 p-8 text-center space-y-2">
        <Inbox className="size-5 text-on-surface-variant mx-auto" />
        <p className="text-[12px] text-on-surface-variant">Nenhuma entrega de webhook ainda.</p>
        <p className="text-[10px] text-on-surface-variant/60">
          Entregas aparecem aqui quando a Botyio chama nossa Callback URL com eventos.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-sm border border-white/10 bg-surface-low/40 overflow-hidden">
      <table className="w-full text-[12px]">
        <thead className="bg-surface-dim/60">
          <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
            <th className="px-3 py-2 font-medium">Evento</th>
            <th className="px-3 py-2 font-medium">Delivery ID</th>
            <th className="px-3 py-2 font-medium text-right">Recebido</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-white/5 hover:bg-surface-dim/30 transition-colors">
              <td className="px-3 py-2 text-on-surface">
                <span className="inline-flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary-container dot-glow" />
                  {EVENT_LABEL[r.event] ?? r.event}
                </span>
              </td>
              <td className="px-3 py-2 font-mono text-[11px] text-on-surface-variant">
                {r.deliveryId.length > 16 ? `${r.deliveryId.slice(0, 8)}…${r.deliveryId.slice(-4)}` : r.deliveryId}
              </td>
              <td className="px-3 py-2 text-right text-on-surface-variant">
                {new Date(r.receivedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
