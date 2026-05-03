import { apiClient } from '@/lib/api'
import type { ApiList, ApiSuccess } from '@/lib/api'
import type {
  CategoryDto,
  CreatePostInput,
  PostDto,
  PostListQuery,
  UpdatePostInput,
} from '@aumaf/shared'

export const postsApi = {
  async list(query: Partial<PostListQuery> = {}) {
    const { data } = await apiClient.get<ApiList<PostDto>>('/posts', { params: query })
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
