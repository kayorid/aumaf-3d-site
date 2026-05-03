import { Loader2 } from 'lucide-react'

export function LoadingScreen({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="size-8 text-primary-500 animate-spin" />
      <p className="text-text-secondary text-sm">{label}</p>
    </div>
  )
}
