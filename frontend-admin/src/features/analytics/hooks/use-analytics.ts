import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export type Granularity = 'day' | 'hour'

export interface Range {
  from: string // ISO
  to: string // ISO
}

export interface OverviewKpis {
  pageviews: number
  uniqueVisitors: number
  sessions: number
  avgSessionSeconds: number
  bounceRate: number
  conversions: number
  conversionRate: number
  delta: {
    pageviews: number
    uniqueVisitors: number
    sessions: number
    bounceRate: number
    conversions: number
  }
}
export interface TimeseriesPoint {
  bucket: string
  value: number
}
export interface Timeseries {
  metric: string
  granularity: Granularity
  points: TimeseriesPoint[]
}

export interface TopPage {
  path: string
  pageviews: number
  uniqueVisitors: number
  avgDurationSeconds: number
  bounceRate: number
}

export interface EventBreakdown {
  type: string
  name: string | null
  count: number
  uniqueVisitors: number
}

export interface FunnelStep {
  step: string
  stepOrder: number
  visitors: number
  conversionRate: number
}
export interface Funnel {
  name: string
  steps: FunnelStep[]
}

export interface DeviceBreakdown {
  dimension: string
  value: string
  sessions: number
  pageviews: number
}

export interface RealtimeSnapshot {
  activeVisitors: number
  visitors: { visitorId: string; path: string; country: string | null; deviceType: string | null; lastSeenAt: string }[]
  topPaths: { path: string; count: number }[]
}

function qs(range: Range, extra: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams({ from: range.from, to: range.to })
  for (const [k, v] of Object.entries(extra)) if (v !== undefined) params.set(k, String(v))
  return params.toString()
}

export function useOverview(range: Range) {
  return useQuery<OverviewKpis>({
    queryKey: ['analytics', 'overview', range],
    queryFn: async () => (await apiClient.get(`/analytics/overview?${qs(range)}`)).data.data,
  })
}

export function useTimeseries(range: Range, metric: 'pageviews' | 'visitors' | 'sessions', granularity: Granularity = 'day') {
  return useQuery<Timeseries>({
    queryKey: ['analytics', 'timeseries', range, metric, granularity],
    queryFn: async () =>
      (await apiClient.get(`/analytics/timeseries?${qs(range, { metric, granularity })}`)).data.data,
  })
}

export function useTopPages(range: Range, limit = 20) {
  return useQuery<TopPage[]>({
    queryKey: ['analytics', 'top-pages', range, limit],
    queryFn: async () => (await apiClient.get(`/analytics/top-pages?${qs(range, { limit })}`)).data.data,
  })
}

export function useEvents(range: Range, type?: string) {
  return useQuery<EventBreakdown[]>({
    queryKey: ['analytics', 'events', range, type],
    queryFn: async () => (await apiClient.get(`/analytics/events?${qs(range, { type })}`)).data.data,
  })
}

export function useFunnel(range: Range, name = 'lead_conversion') {
  return useQuery<Funnel>({
    queryKey: ['analytics', 'funnel', range, name],
    queryFn: async () => (await apiClient.get(`/analytics/funnels?${qs(range, { name })}`)).data.data,
  })
}

export function useDevices(range: Range, dimension: 'device' | 'os' | 'browser' | 'country' | 'utm_source' | 'referrer') {
  return useQuery<DeviceBreakdown[]>({
    queryKey: ['analytics', 'devices', range, dimension],
    queryFn: async () => (await apiClient.get(`/analytics/devices?${qs(range, { dimension })}`)).data.data,
  })
}

export function useRealtime(refetchMs = 5000) {
  return useQuery<RealtimeSnapshot>({
    queryKey: ['analytics', 'realtime'],
    queryFn: async () => (await apiClient.get('/analytics/realtime')).data.data,
    refetchInterval: refetchMs,
  })
}
