import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type {
  UserDto,
  UserDetailDto,
  CreateUserInput,
  UpdateUserInput,
  PermissionOverride,
  PermissionCatalog,
  ResetPasswordResponse,
} from '@aumaf/shared'

export const usersApi = {
  async list() {
    const { data } = await apiClient.get<ApiSuccess<UserDto[]>>('/users')
    return data.data
  },
  async get(id: string) {
    const { data } = await apiClient.get<ApiSuccess<UserDetailDto>>(`/users/${id}`)
    return data.data
  },
  async create(input: CreateUserInput) {
    const { data } = await apiClient.post<ApiSuccess<{ user: UserDto; temporaryPassword?: string }>>(
      '/users',
      input,
    )
    return data.data
  },
  async update(id: string, input: UpdateUserInput) {
    const { data } = await apiClient.patch<ApiSuccess<UserDto>>(`/users/${id}`, input)
    return data.data
  },
  async remove(id: string) {
    await apiClient.delete(`/users/${id}`)
  },
  async resetPassword(id: string) {
    const { data } = await apiClient.post<ApiSuccess<ResetPasswordResponse>>(`/users/${id}/reset-password`)
    return data.data
  },
  async setPermissions(id: string, permissions: PermissionOverride[]) {
    const { data } = await apiClient.put<ApiSuccess<UserDetailDto>>(`/users/${id}/permissions`, {
      permissions,
    })
    return data.data
  },
}

export const permissionsApi = {
  async catalog() {
    const { data } = await apiClient.get<ApiSuccess<PermissionCatalog>>('/permissions/catalog')
    return data.data
  },
  async me() {
    const { data } = await apiClient.get<ApiSuccess<string[]>>('/permissions/me')
    return data.data
  },
}
