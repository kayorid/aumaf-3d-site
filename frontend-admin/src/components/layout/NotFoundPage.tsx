import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">/ Erro</span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">404</span>
      </div>
      <h1 className="text-[clamp(28px,3vw,40px)] font-bold text-white uppercase leading-none tracking-[-0.03em]">
        Página <span className="text-gradient-green">não encontrada.</span>
      </h1>
      <p className="text-[13px] text-on-surface-variant max-w-sm leading-relaxed">
        O endereço acessado não existe no backoffice.
      </p>
      <Button asChild variant="secondary" size="md">
        <Link to="/dashboard">Voltar ao dashboard</Link>
      </Button>
    </div>
  )
}
