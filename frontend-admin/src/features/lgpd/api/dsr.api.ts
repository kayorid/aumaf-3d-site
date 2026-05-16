import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type { DsrRequestDto, DsrStatus, UpdateDsrRequestInput } from '@aumaf/shared'

interface ListResponse {
  status: 'ok'
  data: DsrRequestDto[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

export const dsrApi = {
  async list(params: { status?: DsrStatus; page?: number; pageSize?: number } = {}) {
    const q: Record<string, string> = {}
    if (params.status) q.status = params.status
    if (params.page) q.page = String(params.page)
    if (params.pageSize) q.pageSize = String(params.pageSize)
    const { data } = await apiClient.get<ListResponse>('/dsr/requests', { params: q })
    return data
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiSuccess<DsrRequestDto>>(`/dsr/requests/${id}`)
    return data.data
  },

  async update(id: string, input: UpdateDsrRequestInput) {
    const { data } = await apiClient.patch<ApiSuccess<DsrRequestDto>>(`/dsr/requests/${id}`, input)
    return data.data
  },

  async exportPii(id: string): Promise<Blob> {
    const res = await apiClient.get(`/dsr/requests/${id}/export`, { responseType: 'blob' })
    return res.data as Blob
  },

  async anonymize(id: string) {
    const { data } = await apiClient.post<ApiSuccess<{ leadsAnonymized: number }>>(
      `/dsr/requests/${id}/anonymize`,
      {},
    )
    return data.data
  },
}
