import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type { ProfileDto, UpdateProfileInput, ChangePasswordInput } from '@aumaf/shared'

export const profileApi = {
  async get() {
    const { data } = await apiClient.get<ApiSuccess<ProfileDto>>('/me')
    return data.data
  },

  async update(input: UpdateProfileInput) {
    const { data } = await apiClient.patch<ApiSuccess<ProfileDto>>('/me', input)
    return data.data
  },

  async changePassword(input: ChangePasswordInput) {
    await apiClient.post('/me/password', input)
  },
}
