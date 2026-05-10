import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type { SettingsDto, UpdateSettingsInput } from '@aumaf/shared'

export const settingsApi = {
  async get() {
    const { data } = await apiClient.get<ApiSuccess<SettingsDto>>('/settings')
    return data.data
  },
  async update(input: UpdateSettingsInput) {
    const { data } = await apiClient.patch<ApiSuccess<SettingsDto>>('/settings', input)
    return data.data
  },
}
