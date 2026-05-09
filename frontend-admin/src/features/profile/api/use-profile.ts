import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UpdateProfileInput, ChangePasswordInput } from '@aumaf/shared'
import { profileApi } from './profile.api'
import { ME_QUERY_KEY } from '@/features/auth/api/use-me'

export const PROFILE_KEY = ['profile'] as const

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: profileApi.get,
    staleTime: 60_000,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileApi.update(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEY })
      qc.invalidateQueries({ queryKey: ME_QUERY_KEY })
      toast.success('Perfil atualizado')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao atualizar perfil'),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => profileApi.changePassword(input),
    onSuccess: () => toast.success('Senha alterada com sucesso'),
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao alterar senha'),
  })
}
