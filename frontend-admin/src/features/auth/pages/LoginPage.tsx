import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Lock } from 'lucide-react'
import { LoginSchema, type LoginInput, templateConfig } from '@template/shared'
import { BrandLockup } from '@/components/layout/BrandLockup'
import { useLogin } from '../api/use-login'
import { useMe } from '../api/use-me'
import { ApiError } from '@/lib/api'

export function LoginPage() {
  const navigate = useNavigate()
  const { data: meData } = useMe()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (meData) navigate('/dashboard', { replace: true })
  }, [meData, navigate])

  const onSubmit = handleSubmit(async (input) => {
    try {
      await login.mutateAsync(input)
      navigate('/dashboard', { replace: true })
    } catch {
      /* tratado abaixo via login.error */
    }
  })

  const errorMessage =
    login.error instanceof ApiError ? login.error.message : login.error ? 'Erro inesperado' : null

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Tech grid de fundo */}
      <div className="absolute inset-0 bg-tech-grid opacity-40 pointer-events-none" />

      {/* Atmospheric glows replicando o site público */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(97,197,79,0.11) 0%, transparent 65%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 40% 40% at 92% 8%, rgba(97,197,79,0.07) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 30% 25% at 4% 96%, rgba(97,197,79,0.05) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute hidden lg:block pointer-events-none"
        style={{
          top: '30%',
          left: '8%',
          width: '360px',
          height: '360px',
          background:
            'radial-gradient(circle, rgba(97,197,79,0.16) 0%, rgba(97,197,79,0.06) 35%, transparent 70%)',
          filter: 'blur(2px)',
          borderRadius: '50%',
        }}
      />

      {/* Linhas decorativas flutuantes */}
      <div
        className="absolute top-24 left-[12%] w-px h-36 bg-gradient-to-b from-transparent via-primary-container/30 to-transparent hidden lg:block pointer-events-none"
        style={{ boxShadow: '0 0 4px rgba(97,197,79,0.3)' }}
      />
      <div
        className="absolute bottom-32 left-[8%] w-20 h-px bg-gradient-to-r from-transparent via-primary-container/25 to-transparent hidden lg:block pointer-events-none"
        style={{ boxShadow: '0 0 4px rgba(97,197,79,0.2)' }}
      />
      <div className="absolute top-1/3 right-12 w-2 h-2 rounded-full bg-primary-container/30 dot-glow animate-pulse-dot hidden lg:block pointer-events-none" />
      <div
        className="absolute top-2/3 right-20 w-1.5 h-1.5 rounded-full bg-primary-container/20 animate-pulse-dot hidden lg:block pointer-events-none"
        style={{ animationDelay: '1.2s', boxShadow: '0 0 6px rgba(97,197,79,0.4)' }}
      />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {/* Coluna esquerda — branding cinematic (atmosférico, sem superfície) */}
        <aside className="hidden lg:flex flex-col justify-between px-14 py-12 relative overflow-hidden">
          {/* Topo — logo Pirulen + handle */}
          <header className="flex items-center gap-3">
            <BrandLockup size={18} />
            <span className="text-[11px] uppercase tracking-[0.3em] text-on-surface-variant border-l border-white/10 pl-3">
              Backoffice
            </span>
          </header>

          {/* Centro — manifesto cinematográfico */}
          <div className="space-y-8 max-w-md">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary-container dot-glow animate-pulse-dot flex-shrink-0" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-primary-container">
                Sistema online // pronto para operar
              </span>
            </div>

            <h1 className="text-display-lg font-bold text-white uppercase leading-none tracking-[-0.04em]">
              Manufatura
              <br />
              <span className="text-gradient-green">aditiva</span>
              <br />
              industrial.
            </h1>

            <p className="text-body-md text-on-surface-variant leading-relaxed max-w-sm">
              Painel administrativo de {templateConfig.name} — gestão de conteúdo, leads e operação digital.
            </p>

            {/* Métricas rápidas */}
            <div className="flex items-center gap-8 pt-6 border-t border-white/10">
              {[
                { value: '+500', label: 'Projetos' },
                { value: '20+', label: 'Materiais' },
                { value: '±0.05', label: 'mm tolerância' },
              ].map((m) => (
                <div key={m.label}>
                  <div className="text-[clamp(20px,2vw,28px)] font-bold text-white leading-none tabular-nums">
                    {m.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-1">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rodapé — assinatura */}
          <footer className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
            <span>v1.0</span>
            <span className="w-1 h-1 rounded-full bg-on-surface-variant/40" />
            <span>build by</span>
            <span className="text-on-surface">kayoridolfi.ai</span>
          </footer>
        </aside>

        {/* Coluna direita — painel do formulário (superfície elevada) */}
        <main className="relative flex items-center justify-center px-6 py-16 lg:px-12 overflow-hidden">
          {/* Camada de superfície da direita — gradiente que rises do centro pra borda */}
          <div
            className="absolute inset-0 pointer-events-none lg:bg-gradient-to-r from-transparent via-surface-low/40 to-surface-low/70"
            aria-hidden="true"
          />
          {/* Glass blur muito sutil no painel */}
          <div
            className="absolute inset-0 pointer-events-none hidden lg:block backdrop-blur-[2px]"
            aria-hidden="true"
            style={{
              background: 'rgba(28, 27, 27, 0.25)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 100%)',
            }}
          />
          {/* Linha vertical separadora com glow verde */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px hidden lg:block pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, rgba(97,197,79,0.35) 30%, rgba(97,197,79,0.35) 70%, transparent 100%)',
              boxShadow: '0 0 12px rgba(97,197,79,0.25)',
            }}
          />
          {/* Glow focal próprio à direita (mais sutil que o da esquerda) */}
          <div
            className="absolute hidden lg:block pointer-events-none"
            aria-hidden="true"
            style={{
              top: '50%',
              right: '-10%',
              width: '420px',
              height: '420px',
              background:
                'radial-gradient(circle, rgba(97,197,79,0.06) 0%, transparent 70%)',
              filter: 'blur(20px)',
              borderRadius: '50%',
              transform: 'translateY(-50%)',
            }}
          />

          <div className="relative w-full max-w-sm">
            {/* Logo mobile */}
            <div className="lg:hidden flex items-center gap-3 mb-12">
              <BrandLockup size={16} />
              <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant border-l border-white/10 pl-3">
                Backoffice
              </span>
            </div>

            {/* Header do form */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[11px] uppercase tracking-[0.2em] text-primary-container font-bold">
                  / 01
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Autenticação
                </span>
              </div>
              <h2 className="text-headline-lg font-bold text-white uppercase leading-tight tracking-[-0.02em]">
                Acesse o
                <br />
                <span className="text-gradient-green">painel admin.</span>
              </h2>
              <p className="text-body-md text-on-surface-variant mt-4">
                Use suas credenciais para gerenciar o conteúdo do site.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-8" noValidate>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-[11px] uppercase tracking-[0.2em] text-on-surface-variant font-bold"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  aria-invalid={!!errors.email}
                  className="input-underline"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-error mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-[11px] uppercase tracking-[0.2em] text-on-surface-variant font-bold"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  className="input-underline"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-error mt-1">{errors.password.message}</p>
                )}
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="border border-error/40 bg-error/10 px-4 py-3 text-sm text-error rounded-sm flex items-start gap-2"
                >
                  <Lock className="size-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={login.isPending}
                className="group w-full inline-flex items-center justify-center gap-3 bg-primary-container text-on-primary text-[11px] font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-sm glow-effect hover:bg-primary-dim hover:shadow-glow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {login.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar no painel
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Footer institucional */}
            <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              <span>São Carlos · SP</span>
              <span>Acesso restrito</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
