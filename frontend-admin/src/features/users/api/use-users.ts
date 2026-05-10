import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateUserInput, UpdateUserInput, PermissionOverride } from '@aumaf/shared'
import { usersApi, permissionsApi } from './users.api'

export const USERS_KEY = ['users'] as const
export const PERMISSIONS_KEY = ['permissions'] as const

export function useUsers() {
  return useQuery({ queryKey: USERS_KEY, queryFn: usersApi.list })
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: [...USERS_KEY, 'detail', id] as const,
    queryFn: () => usersApi.get(id!),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.create(input),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      if (result.temporaryPassword) {
        toast.success(`Usuário criado. Senha temporária: ${result.temporaryPassword}`, { duration: 15000 })
      } else {
        toast.success('Usuário criado')
      }
    },
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao criar usuário'),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => usersApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      toast.success('Usuário atualizado')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao atualizar usuário'),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      toast.success('Usuário desativado')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao desativar usuário'),
  })
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) => usersApi.resetPassword(id),
    onSuccess: (data) => {
      toast.success(`Senha temporária: ${data.temporaryPassword}`, { duration: 20000 })
    },
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao redefinir senha'),
  })
}

export function useSetUserPermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: PermissionOverride[] }) =>
      usersApi.setPermissions(id, permissions),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      toast.success('Permissões salvas')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao salvar permissões'),
  })
}

export function usePermissionCatalog() {
  return useQuery({
    queryKey: [...PERMISSIONS_KEY, 'catalog'] as const,
    queryFn: permissionsApi.catalog,
    staleTime: 5 * 60_000,
  })
}

export function useMyPermissions() {
  return useQuery({
    queryKey: [...PERMISSIONS_KEY, 'me'] as const,
    queryFn: permissionsApi.me,
    staleTime: 60_000,
  })
}
