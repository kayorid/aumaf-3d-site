import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { integrationsApi } from './integrations.api'
import type { UpdateBotyioConfigInput, TestBotyioConnectionInput } from '@aumaf/shared'

export const BOTYIO_CONFIG_KEY = ['integrations', 'botyio'] as const
export const BOTYIO_DELIVERIES_KEY = ['integrations', 'botyio', 'deliveries'] as const

export function useBotyioConfig() {
  return useQuery({
    queryKey: BOTYIO_CONFIG_KEY,
    queryFn: integrationsApi.getBotyio,
    staleTime: 30_000,
  })
}

export function useUpdateBotyioConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateBotyioConfigInput) => integrationsApi.updateBotyio(input),
    onSuccess: (data) => {
      qc.setQueryData(BOTYIO_CONFIG_KEY, data)
    },
  })
}

export function useTestBotyio() {
  return useMutation({
    mutationFn: (input?: TestBotyioConnectionInput) => integrationsApi.testBotyio(input),
  })
}

export function useBotyioDeliveries(limit = 10) {
  return useQuery({
    queryKey: [...BOTYIO_DELIVERIES_KEY, limit],
    queryFn: () => integrationsApi.getDeliveries(limit),
    staleTime: 15_000,
  })
}
