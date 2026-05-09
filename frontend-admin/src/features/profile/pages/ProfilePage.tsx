import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, User, Lock, Activity, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProfile, useUpdateProfile, useChangePassword } from '../api/use-profile'
import { useLogout } from '@/features/auth/api/use-logout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ProfilePage() {
  const { data, isLoading } = useProfile()

  return (
    <div className="space-y-8 animate-fade-in max-w-[900px]">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">/ 07</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Conta</span>
        </div>
        <h1 className="text-[clamp(28px,3vw,40px)] font-bold text-white uppercase leading-none tracking-[-0.03em]">
          Meu <span className="text-gradient-green">perfil.</span>
        </h1>
        <p className="text-[13px] text-on-surface-variant max-w-md leading-relaxed">
          Atualize seus dados de identificação, senha e acompanhe sua sessão.
        </p>
      </header>

      {isLoading || !data ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : (
        <>
          <IdentificationCard profile={data} />
          <SecurityCard mustChange={!!data.mustChangePassword} />
          <SessionCard profile={data} />
        </>
      )}
    </div>
  )
}

function CardHeader({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="size-3.5 text-primary-container" />
      <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">{title}</h2>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-surface-low/60 border border-white/10 rounded-sm p-6 space-y-4">{children}</div>
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70 block mb-1.5">{children}</label>
}

function IdentificationCard({ profile }: { profile: { name: string; email: string; phone?: string | null } }) {
  const update = useUpdateProfile()
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [phone, setPhone] = useState(profile.phone ?? '')

  useEffect(() => {
    setName(profile.name)
    setEmail(profile.email)
    setPhone(profile.phone ?? '')
  }, [profile])

  const dirty = name !== profile.name || email !== profile.email || (phone || null) !== (profile.phone ?? null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dirty) return
    await update.mutateAsync({ name, email, phone: phone || null })
  }

  return (
    <Card>
      <CardHeader icon={User} title="Identificação" />
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Nome completo</FieldLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={120} />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Telefone (opcional)</FieldLabel>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(16) 99999-9999" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={!dirty || update.isPending}>
            {update.isPending && <Loader2 className="size-3 animate-spin" />}
            Salvar alterações
          </Button>
        </div>
      </form>
    </Card>
  )
}

function SecurityCard({ mustChange }: { mustChange: boolean }) {
  const change = useChangePassword()
  const [currentPassword, setCurrent] = useState('')
  const [newPassword, setNew] = useState('')
  const [confirmPassword, setConfirm] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return
    if (newPassword.length < 8) return
    await change.mutateAsync({ currentPassword, newPassword, confirmPassword })
    setCurrent('')
    setNew('')
    setConfirm('')
  }

  const mismatch = !!confirmPassword && confirmPassword !== newPassword
  const tooShort = newPassword.length > 0 && newPassword.length < 8

  return (
    <Card>
      <CardHeader icon={Lock} title="Senha" />
      {mustChange && (
        <div className="border border-amber-400/40 bg-amber-400/5 text-amber-300 px-3 py-2 text-[12px] rounded-sm">
          Você precisa trocar sua senha antes de continuar.
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <FieldLabel>Senha atual</FieldLabel>
          <Input type="password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Nova senha</FieldLabel>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNew(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              aria-invalid={tooShort}
            />
            {tooShort && <p className="text-[11px] text-error mt-1">Mínimo de 8 caracteres.</p>}
          </div>
          <div>
            <FieldLabel>Confirmar nova senha</FieldLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              aria-invalid={mismatch}
            />
            {mismatch && <p className="text-[11px] text-error mt-1">As senhas não coincidem.</p>}
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={!currentPassword || tooShort || mismatch || !newPassword || change.isPending}>
            {change.isPending && <Loader2 className="size-3 animate-spin" />}
            Alterar senha
          </Button>
        </div>
      </form>
    </Card>
  )
}

function SessionCard({ profile }: { profile: { role: string; lastLoginAt?: string | null } }) {
  const navigate = useNavigate()
  const logout = useLogout()
  return (
    <Card>
      <CardHeader icon={Activity} title="Sessão" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
        <div>
          <FieldLabel>Papel</FieldLabel>
          <span className="inline-flex items-center px-2 py-0.5 border border-primary-container/40 text-[10px] uppercase font-bold tracking-[0.2em] text-primary-container">
            {profile.role}
          </span>
        </div>
        <div>
          <FieldLabel>Último login</FieldLabel>
          <span className="text-on-surface">
            {profile.lastLoginAt
              ? format(new Date(profile.lastLoginAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
              : '—'}
          </span>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button
          variant="danger"
          onClick={async () => {
            await logout.mutateAsync()
            navigate('/login', { replace: true })
          }}
        >
          <LogOut className="size-3.5" /> Encerrar sessão
        </Button>
      </div>
    </Card>
  )
}
