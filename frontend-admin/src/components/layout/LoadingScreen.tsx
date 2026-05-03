import { Loader2 } from 'lucide-react'

export function LoadingScreen({ label = 'Carregando' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(97,197,79,0.06) 0%, transparent 70%)',
        }}
      />
      <div className="relative flex items-center gap-1">
        <span className="font-pirulen text-[16px] text-white tracking-[0.06em]">AUMAF</span>
        <span className="font-pirulen text-[16px] text-primary-container tracking-[0.06em]">3D</span>
      </div>
      <Loader2 className="relative size-5 text-primary-container animate-spin" />
      <p className="relative text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">
        {label}
      </p>
    </div>
  )
}
