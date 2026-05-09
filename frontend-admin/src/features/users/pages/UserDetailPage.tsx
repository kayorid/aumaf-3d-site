import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { useUser } from '../api/use-users'
import { UserPermissionsMatrix } from '../components/UserPermissionsMatrix'
import { Button } from '@/components/ui/button'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useUser(id ?? null)

  return (
    <div className="space-y-8 animate-fade-in max-w-[1100px]">
      <Button variant="ghost" size="sm" onClick={() => navigate('/usuarios')}>
        <ArrowLeft className="size-3" /> Voltar
      </Button>

      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">/ 08 / detalhe</span>
        </div>
        <h1 className="text-[clamp(24px,2.5vw,32px)] font-bold text-white uppercase leading-none tracking-[-0.02em]">
          {data?.name ?? 'Carregando…'}
        </h1>
        {data && (
          <p className="text-[13px] text-on-surface-variant">
            {data.email} ·{' '}
            <span className="inline-flex items-center px-1.5 py-0.5 border border-primary-container/40 text-[10px] uppercase font-bold tracking-[0.2em] text-primary-container">
              {data.role}
            </span>
            {!data.active && <span className="ml-2 text-error">(inativo)</span>}
          </p>
        )}
      </header>

      {isLoading && <div className="h-32 bg-white/5 animate-pulse rounded-sm" />}
      {isError && <div className="text-sm text-error">{(error as Error)?.message}</div>}

      {data && (
        <section className="bg-surface-low/60 border border-white/10 rounded-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-primary-container" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">
              Matriz de permissões
            </h2>
          </div>
          <p className="text-[12px] text-on-surface-variant max-w-2xl">
            Comece pelo preset do papel <strong className="text-on-surface">{data.role}</strong>. Cada toggle vira um
            override individual: clique para conceder uma permissão extra (verde) ou revogar uma herdada (vermelho).
            Ao alinhar com o preset, o override é descartado automaticamente.
          </p>
          <UserPermissionsMatrix user={data} />
        </section>
      )}
    </div>
  )
}
