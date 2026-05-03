import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
      <div className="font-mono text-xs tracking-[0.3em] text-text-tertiary uppercase">404</div>
      <h1 className="text-2xl font-semibold text-text-primary">Página não encontrada</h1>
      <p className="text-sm text-text-secondary max-w-sm">
        O endereço acessado não existe no backoffice.
      </p>
      <Button asChild variant="secondary">
        <Link to="/dashboard">Voltar ao dashboard</Link>
      </Button>
    </div>
  )
}
