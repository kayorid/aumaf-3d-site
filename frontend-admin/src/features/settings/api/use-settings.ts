import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from './settings.api'
import type { UpdateSettingsInput } from '@aumaf/shared'

export const SETTINGS_KEY = ['settings'] as const

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: settingsApi.get,
    staleTime: 60_000,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => settingsApi.update(input),
    onSuccess: (data) => {
      qc.setQueryData(SETTINGS_KEY, data)
    },
  })
}
