import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Users as UsersIcon, ShieldCheck, KeyRound, Trash2, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { UserDto } from '@aumaf/shared'
import { useUsers, useDeleteUser, useResetUserPassword } from '../api/use-users'
import { UserFormDialog } from '../components/UserFormDialog'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogActions,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useAuthStore } from '@/stores/auth.store'

export function UsersListPage() {
  const { data, isLoading } = useUsers()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<UserDto | null>(null)
  const [deleting, setDeleting] = useState<UserDto | null>(null)
  const [resetting, setResetting] = useState<UserDto | null>(null)
  const navigate = useNavigate()
  const me = useAuthStore((s) => s.user)

  const del = useDeleteUser()
  const resetPwd = useResetUserPassword()

  return (
    <div className="space-y-8 animate-fade-in max-w-[1400px]">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">/ 08</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Equipe</span>
          </div>
          <h1 className="text-[clamp(28px,3vw,40px)] font-bold text-white uppercase leading-none tracking-[-0.03em]">
            Usuários <span className="text-gradient-green">do backoffice.</span>
          </h1>
          <p className="text-[13px] text-on-surface-variant max-w-md leading-relaxed">
            Gestão de acessos com permissões granulares por feature e ação.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-3.5" /> Novo usuário
        </Button>
      </header>

      <div className="bg-surface-low/60 border border-white/10 rounded-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : data?.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon className="size-5 text-on-surface-variant inline" />
            <p className="text-sm text-on-surface-variant mt-3">Nenhum usuário cadastrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-surface-dim/50">
                <tr className="text-on-surface-variant/70 text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="text-left px-6 py-3">Nome</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left px-6 py-3">Papel</th>
                  <th className="text-left px-6 py-3 hidden lg:table-cell">Status</th>
                  <th className="text-left px-6 py-3 hidden lg:table-cell">Último login</th>
                  <th className="text-right px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {data?.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-on-surface">{user.name}</div>
                      {user.mustChangePassword && (
                        <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300 mt-0.5">
                          ⚠ Senha temporária
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-on-surface-variant text-[12px] hidden md:table-cell">{user.email}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 border border-primary-container/40 text-[10px] uppercase font-bold tracking-[0.2em] text-primary-container">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 hidden lg:table-cell">
                      {user.active ? (
                        <span className="text-[11px] uppercase tracking-[0.2em] text-primary-container">Ativo</span>
                      ) : (
                        <span className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant/40">Inativo</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-on-surface-variant/80 hidden lg:table-cell text-[12px]">
                      {user.lastLoginAt
                        ? format(new Date(user.lastLoginAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                        : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/usuarios/${user.id}`)}
                          className="p-1.5 rounded-sm text-on-surface-variant hover:text-primary-container hover:bg-white/5 focus-ring"
                          title="Permissões"
                          aria-label="Permissões"
                        >
                          <ShieldCheck className="size-4" />
                        </button>
                        <button
                          onClick={() => setEditing(user)}
                          className="p-1.5 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 focus-ring"
                          title="Editar"
                          aria-label="Editar"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setResetting(user)}
                          className="p-1.5 rounded-sm text-on-surface-variant hover:text-amber-300 hover:bg-amber-300/5 focus-ring"
                          title="Redefinir senha"
                          aria-label="Redefinir senha"
                        >
                          <KeyRound className="size-4" />
                        </button>
                        {user.id !== me?.id && (
                          <button
                            onClick={() => setDeleting(user)}
                            className="p-1.5 rounded-sm text-on-surface-variant hover:text-error hover:bg-error/5 focus-ring"
                            title="Desativar"
                            aria-label="Desativar"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <UserFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        user={editing}
      />

      {deleting && (
        <AlertDialog open onOpenChange={(open) => !open && setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogTitle>Desativar usuário</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-on-surface">{deleting.name}</strong> deixará de poder fazer login. O histórico
              (posts, anotações de leads) é preservado.
            </AlertDialogDescription>
            <AlertDialogActions>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await del.mutateAsync(deleting.id)
                  setDeleting(null)
                }}
              >
                {del.isPending ? 'Desativando…' : 'Desativar'}
              </AlertDialogAction>
            </AlertDialogActions>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {resetting && (
        <AlertDialog open onOpenChange={(open) => !open && setResetting(null)}>
          <AlertDialogContent>
            <AlertDialogTitle>Redefinir senha</AlertDialogTitle>
            <AlertDialogDescription>
              Será gerada uma senha temporária para <strong className="text-on-surface">{resetting.name}</strong>. O
              usuário deverá trocá-la no próximo login. A senha aparecerá apenas uma vez no toast — anote ou repasse
              imediatamente.
            </AlertDialogDescription>
            <AlertDialogActions>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="primary"
                onClick={async () => {
                  await resetPwd.mutateAsync(resetting.id)
                  setResetting(null)
                }}
              >
                {resetPwd.isPending ? 'Gerando…' : 'Gerar nova senha'}
              </AlertDialogAction>
            </AlertDialogActions>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
