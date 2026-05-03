import { useQuery } from '@tanstack/react-query'
import type { LeadFilterQuery } from '@aumaf/shared'
import { leadsApi } from './leads.api'

export const LEADS_KEY = ['leads'] as const

export function useLeads(query: Partial<LeadFilterQuery>) {
  return useQuery({
    queryKey: [...LEADS_KEY, 'list', query],
    queryFn: () => leadsApi.list(query),
    placeholderData: (prev) => prev,
  })
}

export function useLeadSources() {
  return useQuery({
    queryKey: [...LEADS_KEY, 'sources'] as const,
    queryFn: leadsApi.sources,
    staleTime: 5 * 60_000,
  })
}
