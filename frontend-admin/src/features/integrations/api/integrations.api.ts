import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type {
  BotyioConfigDto,
  UpdateBotyioConfigInput,
  BotyioTestResult,
  TestBotyioConnectionInput,
  BotyioDeliveryDto,
} from '@template/shared'

const BASE = '/admin/integrations/botyio'

export const integrationsApi = {
  async getBotyio() {
    const { data } = await apiClient.get<ApiSuccess<BotyioConfigDto>>(BASE)
    return data.data
  },

  async updateBotyio(input: UpdateBotyioConfigInput) {
    const { data } = await apiClient.put<ApiSuccess<BotyioConfigDto>>(BASE, input)
    return data.data
  },

  async testBotyio(input: TestBotyioConnectionInput = {}) {
    const { data } = await apiClient.post<BotyioTestResult>(`${BASE}/test`, input)
    return data
  },

  async getDeliveries(limit = 10) {
    const { data } = await apiClient.get<ApiSuccess<BotyioDeliveryDto[]>>(
      `${BASE}/deliveries`,
      { params: { limit } },
    )
    return data.data
  },
}
