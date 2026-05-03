import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema, type LoginInput } from '@aumaf/shared'
import { useLogin } from '../api/use-login'
import { useMe } from '../api/use-me'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      // tratado abaixo via login.error
    }
  })

  const errorMessage =
    login.error instanceof ApiError ? login.error.message : login.error ? 'Erro inesperado' : null

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-surface-50 border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 20%, rgba(97,197,79,0.15), transparent 50%), radial-gradient(circle at 80% 80%, rgba(97,197,79,0.08), transparent 60%)',
            }}
          />
        </div>
        <div className="relative">
          <h1 className="font-mono text-xs tracking-[0.3em] text-text-tertiary uppercase">
            AUMAF 3D / Backoffice
          </h1>
        </div>
        <div className="relative space-y-3 max-w-md">
          <p className="text-3xl font-light leading-tight text-text-primary">
            Cinematic <span className="text-primary-400">additive</span> manufacturing.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Painel administrativo para gestão de conteúdo, leads e operação digital da AUMAF 3D —
            São Carlos, SP.
          </p>
        </div>
        <div className="relative text-xs text-text-tertiary font-mono">
          v1.0 · build by{' '}
          <span className="text-text-secondary">kayoridolfi.ai</span>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-text-primary">Entrar no backoffice</h2>
            <p className="text-sm text-text-secondary mt-2">
              Use suas credenciais para gerenciar o conteúdo do site.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-danger-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-danger-400">{errors.password.message}</p>
              )}
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-md border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-400"
              >
                {errorMessage}
              </div>
            )}

            <Button type="submit" loading={login.isPending} className="w-full" size="lg">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
