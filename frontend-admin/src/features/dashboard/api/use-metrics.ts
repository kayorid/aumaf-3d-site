import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type { DashboardMetrics } from '@aumaf/shared'

export const DASHBOARD_QUERY_KEY = ['metrics', 'dashboard'] as const

export function useDashboardMetrics() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiSuccess<DashboardMetrics>>('/metrics/dashboard')
      return data.data
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
