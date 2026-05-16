import { useState } from 'react'
import { Activity, BarChart3, Funnel, Globe2, LayoutGrid, MousePointerClick, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RangePicker } from '../components/RangePicker'
import { KpiCard } from '../components/KpiCard'
import { TimeseriesChart } from '../components/TimeseriesChart'
import { TopPagesTable } from '../components/TopPagesTable'
import { EventsTable } from '../components/EventsTable'
import { FunnelView } from '../components/FunnelView'
import { DevicesPanel } from '../components/DevicesPanel'
import { RealtimePanel } from '../components/RealtimePanel'
import { useOverview, useTimeseries } from '../hooks/use-analytics'
import { useAnalyticsRange } from '../hooks/use-range'

type Tab = 'overview' | 'pages' | 'events' | 'funnel' | 'devices' | 'realtime'

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview',  icon: LayoutGrid },
  { id: 'pages',    label: 'Páginas',   icon: BarChart3 },
  { id: 'events',   label: 'Eventos',   icon: MousePointerClick },
  { id: 'funnel',   label: 'Funil',     icon: Funnel },
  { id: 'devices',  label: 'Fontes',    icon: Globe2 },
  { id: 'realtime', label: 'Realtime',  icon: Radio },
]

function fmtDuration(s: number) {
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m}m ${r}s` : `${r}s`
}

export function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const range = useAnalyticsRange()
  const { data: kpi, isLoading: kpiLoading } = useOverview(range)
  const { data: tsPv, isLoading: tsPvLoading } = useTimeseries(range, 'pageviews', 'day')
  const { data: tsVis } = useTimeseries(range, 'visitors', 'day')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary-container" />
            <span className="text-label-caps uppercase tracking-[0.2em] text-on-surface-variant text-[11px] font-bold">
              Analytics próprio
            </span>
          </div>
          <h1 className="mt-2 text-3xl lg:text-4xl font-bold uppercase tracking-tight text-white">
            Painel de Métricas
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Pipeline 100% AUMAF — dados independentes do GA4 e Clarity.
          </p>
        </div>
        <RangePicker />
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 overflow-x-auto">
        <div className="inline-flex min-w-full gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] border-b-2 transition-colors whitespace-nowrap',
                tab === id
                  ? 'border-primary-container text-primary-container'
                  : 'border-transparent text-on-surface-variant hover:text-white',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard label="Pageviews"   value={kpi?.pageviews ?? 0}      delta={kpi?.delta.pageviews}      loading={kpiLoading} />
            <KpiCard label="Visitantes"  value={kpi?.uniqueVisitors ?? 0} delta={kpi?.delta.uniqueVisitors} loading={kpiLoading} />
            <KpiCard label="Sessões"     value={kpi?.sessions ?? 0}       delta={kpi?.delta.sessions}       loading={kpiLoading} />
            <KpiCard
              label="Tempo médio"
              value={kpi ? fmtDuration(kpi.avgSessionSeconds) : '—'}
              loading={kpiLoading}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Bounce Rate"
              value={kpi ? `${(kpi.bounceRate * 100).toFixed(0)}%` : '—'}
              delta={kpi?.delta.bounceRate}
              inverted
              loading={kpiLoading}
            />
            <KpiCard label="Conversões" value={kpi?.conversions ?? 0} delta={kpi?.delta.conversions} loading={kpiLoading} />
            <KpiCard
              label="Taxa de conversão"
              value={kpi ? `${(kpi.conversionRate * 100).toFixed(2)}%` : '—'}
              loading={kpiLoading}
            />
            <KpiCard
              label="Engajamento"
              value={kpi ? `${(100 - kpi.bounceRate * 100).toFixed(0)}%` : '—'}
              hint="1 - bounce"
              loading={kpiLoading}
            />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <TimeseriesChart data={tsPv}  title="Pageviews / dia"  loading={tsPvLoading} />
            <TimeseriesChart data={tsVis} title="Visitantes únicos / dia" />
          </div>
          <TopPagesTable />
        </div>
      )}

      {tab === 'pages'   && <TopPagesTable />}
      {tab === 'events'  && <EventsTable />}
      {tab === 'funnel'  && <FunnelView />}
      {tab === 'devices' && <DevicesPanel />}
      {tab === 'realtime' && <RealtimePanel />}
    </div>
  )
}
