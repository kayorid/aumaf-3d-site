import { useState, useEffect } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X, Loader2 } from 'lucide-react'
import type { UserDto, CreateUserInput, UpdateUserInput, UserRole } from '@aumaf/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useCreateUser, useUpdateUser } from '../api/use-users'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: UserDto | null
}

export function UserFormDialog({ open, onOpenChange, user }: Props) {
  const isEdit = !!user
  const create = useCreateUser()
  const update = useUpdateUser()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole>('EDITOR')
  const [active, setActive] = useState(true)
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone ?? '')
      setRole(user.role)
      setActive(user.active)
      setPassword('')
    } else if (open) {
      setName('')
      setEmail('')
      setPhone('')
      setRole('EDITOR')
      setActive(true)
      setPassword('')
    }
  }, [user, open])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEdit && user) {
      const input: UpdateUserInput = {
        name,
        email,
        role,
        active,
        phone: phone || null,
      }
      await update.mutateAsync({ id: user.id, input })
    } else {
      const input: CreateUserInput = {
        name,
        email,
        role,
        active,
        phone: phone || null,
        password: password || undefined,
        permissions: [],
      }
      await create.mutateAsync(input)
    }
    onOpenChange(false)
  }

  const pending = create.isPending || update.isPending

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg bg-surface-low border border-white/10 rounded-sm shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <DialogPrimitive.Title className="text-[14px] font-bold uppercase tracking-[-0.01em] text-white">
              {isEdit ? 'Editar usuário' : 'Novo usuário'}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="p-1.5 rounded-sm hover:bg-white/5 text-on-surface-variant focus-ring">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          <form onSubmit={submit} className="px-6 py-5 space-y-4">
            <Field label="Nome">
              <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Telefone (opcional)">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(16) 99999-9999" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Papel">
                <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="EDITOR">EDITOR</option>
                  <option value="MARKETING">MARKETING</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select
                  value={active ? '1' : '0'}
                  onChange={(e) => setActive(e.target.value === '1')}
                >
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </Select>
              </Field>
            </div>
            {!isEdit && (
              <Field label="Senha (deixe em branco para gerar temporária)">
                <Input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  minLength={password ? 8 : 0}
                  autoComplete="new-password"
                />
              </Field>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <DialogPrimitive.Close asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
              </DialogPrimitive.Close>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-3 animate-spin" />}
                {isEdit ? 'Salvar' : 'Criar usuário'}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70 block mb-1.5">{label}</label>
      {children}
    </div>
  )
}
