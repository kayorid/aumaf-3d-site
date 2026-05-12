import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { DsrStatus, UpdateDsrRequestInput } from '@aumaf/shared'
import { dsrApi } from './dsr.api'

export const DSR_KEY = ['dsr'] as const

export function useDsrList(params: { status?: DsrStatus; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [...DSR_KEY, 'list', params],
    queryFn: () => dsrApi.list(params),
    placeholderData: (prev) => prev,
  })
}

export function useDsrDetail(id: string | null) {
  return useQuery({
    queryKey: [...DSR_KEY, 'detail', id] as const,
    queryFn: () => dsrApi.getById(id!),
    enabled: !!id,
  })
}

export function useUpdateDsr() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDsrRequestInput }) =>
      dsrApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DSR_KEY })
      toast.success('Solicitação atualizada')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao atualizar'),
  })
}

export function useAnonymizeDsr() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dsrApi.anonymize(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: DSR_KEY })
      toast.success(`Anonimização concluída — ${res.leadsAnonymized} lead(s) afetado(s)`)
    },
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao anonimizar'),
  })
}
