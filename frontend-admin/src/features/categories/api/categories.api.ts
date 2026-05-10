import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type {
  CategoryDto,
  CategoryDtoWithCount,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@aumaf/shared'

export const categoriesApi = {
  async list() {
    const { data } = await apiClient.get<ApiSuccess<CategoryDtoWithCount[]>>('/categories')
    return data.data
  },
  async create(input: CreateCategoryInput) {
    const { data } = await apiClient.post<ApiSuccess<CategoryDto>>('/categories', input)
    return data.data
  },
  async update(id: string, input: UpdateCategoryInput) {
    const { data } = await apiClient.patch<ApiSuccess<CategoryDto>>(`/categories/${id}`, input)
    return data.data
  },
  async delete(id: string) {
    await apiClient.delete(`/categories/${id}`)
  },
}
