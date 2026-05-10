import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mediaApi } from './media.api'
import type { MediaListQuery, RegisterMediaInput, UpdateMediaInput } from '@aumaf/shared'

export const MEDIA_LIST_KEY = ['media', 'list'] as const

export function useMediaList(params: Partial<MediaListQuery>) {
  return useQuery({
    queryKey: [...MEDIA_LIST_KEY, params],
    queryFn: () => mediaApi.list(params),
    staleTime: 15_000,
  })
}

export function useRegisterMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterMediaInput) => mediaApi.register(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: MEDIA_LIST_KEY }),
  })
}

export function useUpdateMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMediaInput }) =>
      mediaApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: MEDIA_LIST_KEY }),
  })
}

export function useDeleteMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mediaApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: MEDIA_LIST_KEY }),
  })
}
