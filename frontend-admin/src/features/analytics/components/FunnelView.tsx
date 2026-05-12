import { useFunnel } from '../hooks/use-analytics'
import { useRange } from '../hooks/use-range'

const STEP_LABEL: Record<string, string> = {
  visit: 'Visita',
  cta_click: 'Clique em CTA',
  form_start: 'Início do form',
  form_submit: 'Envio do form',
  lead_created: 'Lead criado',
}

export function FunnelView() {
  const range = useRange((s) => s.range())
  const { data, isLoading } = useFunnel(range, 'lead_conversion')
  const top = data?.steps[0]?.visitors ?? 0

  return (
    <div className="surface-card border border-white/8 rounded-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8">
        <h3 className="text-label-caps uppercase tracking-[0.2em] text-on-surface-variant text-[11px] font-bold">
          Funil de conversão (lead)
        </h3>
        <p className="text-xs text-on-surface-variant mt-1">Visita → CTA → Form → Submit → Lead</p>
      </div>
      <div className="p-5 space-y-3">
        {isLoading && <div className="text-on-surface-variant text-sm py-8 text-center">Carregando…</div>}
        {!isLoading && (data?.steps.length ?? 0) === 0 && (
          <div className="text-on-surface-variant text-sm py-8 text-center">Sem dados no período.</div>
        )}
        {data?.steps.map((step, i) => {
          const pct = top > 0 ? (step.visitors / top) * 100 : 0
          const isFirst = i === 0
          return (
            <div key={step.step} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-primary-container font-bold text-[11px] uppercase tracking-[0.18em] w-6 text-right">
                    0{step.stepOrder}
                  </span>
                  <span className="text-white font-medium">{STEP_LABEL[step.step] ?? step.step}</span>
                </div>
                <div className="flex items-center gap-4 tabular-nums">
                  <span className="text-white font-bold">{step.visitors.toLocaleString('pt-BR')}</span>
                  {!isFirst && (
                    <span className="text-on-surface-variant text-xs w-16 text-right">
                      {(step.conversionRate * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-8 w-full bg-white/[0.03] rounded-sm overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-primary-container/70 to-primary-container/30 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
