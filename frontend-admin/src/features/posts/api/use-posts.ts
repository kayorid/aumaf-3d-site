import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { postsApi, categoriesApi } from './posts.api'
import type { CreatePostInput, PostListQuery, UpdatePostInput } from '@template/shared'
import { DASHBOARD_QUERY_KEY } from '@/features/dashboard/api/use-metrics'

export const POSTS_KEY = ['posts'] as const

export function usePosts(query: Partial<PostListQuery>) {
  return useQuery({
    queryKey: [...POSTS_KEY, 'list', query],
    queryFn: () => postsApi.list(query),
    placeholderData: (prev) => prev,
  })
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: [...POSTS_KEY, 'detail', id],
    queryFn: () => postsApi.get(id!),
    enabled: !!id,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'] as const,
    queryFn: categoriesApi.list,
    staleTime: 10 * 60_000,
  })
}

function invalidatePosts(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: POSTS_KEY })
  qc.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePostInput) => postsApi.create(input),
    onSuccess: () => invalidatePosts(qc),
  })
}

export function useUpdatePost(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdatePostInput) => postsApi.update(id, input),
    onSuccess: (post) => {
      qc.setQueryData([...POSTS_KEY, 'detail', id], post)
      invalidatePosts(qc)
    },
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => invalidatePosts(qc),
  })
}

export function usePublishPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => postsApi.publish(id),
    onSuccess: (post) => {
      qc.setQueryData([...POSTS_KEY, 'detail', post.id], post)
      invalidatePosts(qc)
    },
  })
}

export function useUnpublishPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => postsApi.unpublish(id),
    onSuccess: (post) => {
      qc.setQueryData([...POSTS_KEY, 'detail', post.id], post)
      invalidatePosts(qc)
    },
  })
}
