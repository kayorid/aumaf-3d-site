import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from './categories.api'
import type { CreateCategoryInput, UpdateCategoryInput } from '@aumaf/shared'

export const CATEGORIES_KEY = ['categories'] as const

export function useCategoriesWithCount() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: categoriesApi.list,
  })
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
  qc.invalidateQueries({ queryKey: ['posts'] })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesApi.create(input),
    onSuccess: () => invalidate(qc),
  })
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => categoriesApi.update(id, input),
    onSuccess: () => invalidate(qc),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => invalidate(qc),
  })
}
