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

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Olá, {user?.name?.split(' ')[0] ?? 'Admin'}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Visão geral do conteúdo e leads do site.
          </p>
        </div>
        <Button asChild>
          <Link to="/posts/new">
            <Plus className="size-4" />
            Novo post
          </Link>
        </Button>
      </header>

      {isError && (
        <div
          role="alert"
          className="rounded-md border border-danger-500/30 bg-danger-500/10 p-4 text-sm text-danger-400"
        >
          Erro ao carregar métricas: {(error as Error).message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Posts publicados"
          value={data?.postsPublished ?? 0}
          icon={<FileText className="size-4" />}
          variant="primary"
          loading={isLoading}
        />
        <KpiCard
          label="Em rascunho"
          value={data?.postsDraft ?? 0}
          icon={<FileEdit className="size-4" />}
          variant="warn"
          loading={isLoading}
        />
        <KpiCard
          label="Leads (30d)"
          value={data?.leadsLast30d ?? 0}
          icon={<Users className="size-4" />}
          loading={isLoading}
        />
        <KpiCard
          label="Gerados por IA"
          value={data?.postsByAi ?? 0}
          icon={<Sparkles className="size-4" />}
          variant="primary"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentPostsList posts={data?.recentPosts ?? []} loading={isLoading} />
        <RecentLeadsList leads={data?.recentLeads ?? []} loading={isLoading} />
      </div>
    </div>
  )
}
