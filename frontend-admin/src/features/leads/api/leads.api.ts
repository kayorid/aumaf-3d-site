import { apiClient } from '@/lib/api'
import type { ApiList, ApiSuccess } from '@/lib/api'
import type { LeadDto, LeadFilterQuery } from '@aumaf/shared'

export const leadsApi = {
  async list(query: Partial<LeadFilterQuery> = {}) {
    const params: Record<string, string> = {}
    if (query.page) params.page = String(query.page)
    if (query.pageSize) params.pageSize = String(query.pageSize)
    if (query.from) params.from = (query.from as Date).toISOString()
    if (query.to) params.to = (query.to as Date).toISOString()
    if (query.source) params.source = query.source
    if (query.q) params.q = query.q
    const { data } = await apiClient.get<ApiList<LeadDto>>('/leads', { params })
    return data
  },

  async sources() {
    const { data } = await apiClient.get<ApiSuccess<string[]>>('/leads/sources')
    return data.data
  },

  async exportCsvUrl(query: Partial<LeadFilterQuery> = {}): Promise<string> {
    const params = new URLSearchParams()
    if (query.from) params.set('from', (query.from as Date).toISOString())
    if (query.to) params.set('to', (query.to as Date).toISOString())
    if (query.source) params.set('source', query.source)
    if (query.q) params.set('q', query.q)
    const baseURL = apiClient.defaults.baseURL ?? ''
    const qs = params.toString() ? `?${params.toString()}` : ''
    return `${baseURL}/leads/export.csv${qs}`
  },
}
