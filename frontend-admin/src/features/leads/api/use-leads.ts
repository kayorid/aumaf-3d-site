import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { LeadFilterQuery, CreateLeadNoteInput, UpdateLeadNoteInput } from '@aumaf/shared'
import { leadsApi } from './leads.api'

export const LEADS_KEY = ['leads'] as const

export function useLeads(query: Partial<LeadFilterQuery>) {
  return useQuery({
    queryKey: [...LEADS_KEY, 'list', query],
    queryFn: () => leadsApi.list(query),
    placeholderData: (prev) => prev,
  })
}

export function useLeadSources() {
  return useQuery({
    queryKey: [...LEADS_KEY, 'sources'] as const,
    queryFn: leadsApi.sources,
    staleTime: 5 * 60_000,
  })
}

export function useLeadDetail(id: string | null) {
  return useQuery({
    queryKey: [...LEADS_KEY, 'detail', id] as const,
    queryFn: () => leadsApi.getById(id!),
    enabled: !!id,
  })
}

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leadsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEADS_KEY })
      toast.success('Lead excluído')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao excluir lead'),
  })
}

export function useAddLeadNote(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateLeadNoteInput) => leadsApi.addNote(leadId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...LEADS_KEY, 'detail', leadId] })
    },
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao adicionar anotação'),
  })
}

export function useUpdateLeadNote(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ noteId, input }: { noteId: string; input: UpdateLeadNoteInput }) =>
      leadsApi.updateNote(leadId, noteId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...LEADS_KEY, 'detail', leadId] })
    },
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao editar anotação'),
  })
}

export function useDeleteLeadNote(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (noteId: string) => leadsApi.deleteNote(leadId, noteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...LEADS_KEY, 'detail', leadId] })
    },
    onError: (err: Error) => toast.error(err.message ?? 'Falha ao excluir anotação'),
  })
}
