import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type { AuthUser, LoginInput } from '@template/shared'

export const authApi = {
  async login(input: LoginInput): Promise<AuthUser> {
    const { data } = await apiClient.post<ApiSuccess<{ user: AuthUser }>>('/auth/login', input)
    return data.data.user
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<ApiSuccess<{ user: AuthUser }>>('/auth/me')
    return data.data.user
  },
}
