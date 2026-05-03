import { useQuery } from '@tanstack/react-query'
import { authApi } from './auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { useEffect } from 'react'

export const ME_QUERY_KEY = ['auth', 'me'] as const

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser)

  const query = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: authApi.me,
    staleTime: 5 * 60_000,
    retry: false,
  })

  useEffect(() => {
    if (query.data) setUser(query.data)
    if (query.isError) setUser(null)
  }, [query.data, query.isError, setUser])

  return query
}
