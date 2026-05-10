import { apiClient } from '@/lib/api'
import type { ApiList, ApiSuccess } from '@/lib/api'
import type {
  CategoryDto,
  CreatePostInput,
  PostDto,
  PostListQuery,
  UpdatePostInput,
} from '@template/shared'

export const postsApi = {
  async list(query: Partial<PostListQuery> = {}) {
    const params: Record<string, string | number | boolean> = {}
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue
      if (v instanceof Date) params[k] = v.toISOString()
      else params[k] = v as string | number | boolean
    }
    const { data } = await apiClient.get<ApiList<PostDto>>('/posts', { params })
    return data
  },

  async get(id: string) {
    const { data } = await apiClient.get<ApiSuccess<PostDto>>(`/posts/${id}`)
    return data.data
  },

  async create(input: CreatePostInput) {
    const { data } = await apiClient.post<ApiSuccess<PostDto>>('/posts', input)
    return data.data
  },

  async update(id: string, input: UpdatePostInput) {
    const { data } = await apiClient.patch<ApiSuccess<PostDto>>(`/posts/${id}`, input)
    return data.data
  },

  async delete(id: string) {
    await apiClient.delete(`/posts/${id}`)
  },

  async publish(id: string) {
    const { data } = await apiClient.post<ApiSuccess<PostDto>>(`/posts/${id}/publish`)
    return data.data
  },

  async unpublish(id: string) {
    const { data } = await apiClient.post<ApiSuccess<PostDto>>(`/posts/${id}/unpublish`)
    return data.data
  },
}

export const categoriesApi = {
  async list() {
    const { data } = await apiClient.get<ApiSuccess<CategoryDto[]>>('/categories')
    return data.data
  },
}
