import { apiClient } from '@/lib/api'
import type { ApiList, ApiSuccess } from '@/lib/api'
import type {
  LeadDto,
  LeadFilterQuery,
  LeadDetailDto,
  LeadNoteDto,
  CreateLeadNoteInput,
  UpdateLeadNoteInput,
} from '@aumaf/shared'

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

  async getById(id: string) {
    const { data } = await apiClient.get<ApiSuccess<LeadDetailDto>>(`/leads/${id}`)
    return data.data
  },

  async remove(id: string) {
    await apiClient.delete(`/leads/${id}`)
  },

  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    const { data } = await apiClient.post<ApiSuccess<{ deleted: number }>>(
      '/leads/bulk-delete',
      { ids },
    )
    return data.data
  },

  async addNote(leadId: string, input: CreateLeadNoteInput) {
    const { data } = await apiClient.post<ApiSuccess<LeadNoteDto>>(`/leads/${leadId}/notes`, input)
    return data.data
  },

  async updateNote(leadId: string, noteId: string, input: UpdateLeadNoteInput) {
    const { data } = await apiClient.patch<ApiSuccess<LeadNoteDto>>(`/leads/${leadId}/notes/${noteId}`, input)
    return data.data
  },

  async deleteNote(leadId: string, noteId: string) {
    await apiClient.delete(`/leads/${leadId}/notes/${noteId}`)
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
