import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from './auth.api'
import { useAuthStore } from '@/stores/auth.store'

export function useLogout() {
  const qc = useQueryClient()
  const clear = useAuthStore((s) => s.clear)

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clear()
      qc.clear()
    },
  })
}
