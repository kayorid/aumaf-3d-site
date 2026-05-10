import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from './auth.api'
import { ME_QUERY_KEY } from './use-me'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginInput } from '@template/shared'

export function useLogin() {
  const qc = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (user) => {
      setUser(user)
      qc.setQueryData(ME_QUERY_KEY, user)
    },
  })
}
