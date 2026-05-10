import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type {
  MediaAssetDto,
  MediaListQuery,
  MediaListResponse,
  RegisterMediaInput,
  UpdateMediaInput,
} from '@aumaf/shared'

const BASE = '/media'

export const mediaApi = {
  async list(params: Partial<MediaListQuery>) {
    const { data } = await apiClient.get<ApiSuccess<MediaListResponse>>(BASE, { params })
    return data.data
  },
  async register(input: RegisterMediaInput) {
    const { data } = await apiClient.post<ApiSuccess<MediaAssetDto>>(BASE, input)
    return data.data
  },
  async update(id: string, input: UpdateMediaInput) {
    const { data } = await apiClient.patch<ApiSuccess<MediaAssetDto>>(`${BASE}/${id}`, input)
    return data.data
  },
  async remove(id: string) {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
