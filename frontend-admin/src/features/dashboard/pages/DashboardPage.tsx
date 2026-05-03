import { FileText, FileEdit, Users, Sparkles, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDashboardMetrics } from '../api/use-metrics'
import { KpiCard } from '../components/KpiCard'
import { RecentPostsList } from '../components/RecentPostsList'
import { RecentLeadsList } from '../components/RecentLeadsList'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError, error } = useDashboardMetrics()
  const firstName = user?.name?.split(' ')[0] ?? 'Admin'

  return (
    <div className="space-y-10 animate-fade-in max-w-[1400px]">
      {/* Header */}
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">
              / 01
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">
              Dashboard
            </span>
          </div>
          <h1 className="text-[clamp(32px,4vw,48px)] font-bold text-white uppercase leading-none tracking-[-0.03em]">
            Olá, <span className="text-gradient-green">{firstName}</span>.
          </h1>
          <p className="text-[13px] text-on-surface-variant max-w-md leading-relaxed">
            Visão geral do conteúdo e leads do site. Atualizado em tempo real.
          </p>
        </div>
        <Button asChild size="md">
          <Link to="/posts/new">
            <Plus className="size-3.5" />
            Novo post
          </Link>
        </Button>
      </header>

      {isError && (
        <div
          role="alert"
          className="border border-error/40 bg-error/5 px-4 py-3 text-sm text-error rounded-sm"
        >
          Erro ao carregar métricas: {(error as Error).message}
        </div>
      )}

      {/* Métricas */}
      <section aria-label="Métricas">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[9px] font-mono text-on-surface-variant/60 tracking-[0.2em]">
            // MÉTRICAS
          </span>
          <span className="flex-1 h-px bg-white/10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            number="01"
            label="Posts publicados"
            value={data?.postsPublished ?? 0}
            icon={<FileText />}
            variant="primary"
            loading={isLoading}
          />
          <KpiCard
            number="02"
            label="Em rascunho"
            value={data?.postsDraft ?? 0}
            icon={<FileEdit />}
            variant="warn"
            loading={isLoading}
          />
          <KpiCard
            number="03"
            label="Leads (30d)"
            value={data?.leadsLast30d ?? 0}
            icon={<Users />}
            variant="neutral"
            loading={isLoading}
          />
          <KpiCard
            number="04"
            label="Gerados por IA"
            value={data?.postsByAi ?? 0}
            icon={<Sparkles />}
            variant="primary"
            loading={isLoading}
          />
        </div>
      </section>

      {/* Atividade recente */}
      <section aria-label="Atividade recente">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[9px] font-mono text-on-surface-variant/60 tracking-[0.2em]">
            // ATIVIDADE
          </span>
          <span className="flex-1 h-px bg-white/10" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentPostsList posts={data?.recentPosts ?? []} loading={isLoading} />
          <RecentLeadsList leads={data?.recentLeads ?? []} loading={isLoading} />
        </div>
      </section>
    </div>
  )
}
