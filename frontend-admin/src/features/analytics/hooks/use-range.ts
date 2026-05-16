import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RangePreset = '24h' | '7d' | '30d' | '90d' | 'custom'

interface RangeState {
  preset: RangePreset
  customFrom: string | null
  customTo: string | null
  // Buckets discretizados para tornar `useAnalyticsRange()` estável entre re-renders.
  // Trocam apenas quando o preset OU o bucket horário (UTC) muda.
  setPreset: (p: RangePreset) => void
  setCustom: (from: string, to: string) => void
}

export const useRange = create<RangeState>()(
  persist(
    (set) => ({
      preset: '30d',
      customFrom: null,
      customTo: null,
      setPreset: (preset) => set({ preset }),
      setCustom: (customFrom, customTo) => set({ customFrom, customTo, preset: 'custom' }),
    }),
    { name: 'aumaf-analytics-range' },
  ),
)

/**
 * Computa o range ISO atual baseado no preset, ancorado ao topo da hora UTC
 * (não a `Date.now()` cru). Isso garante que o objeto retornado é estável
 * entre re-renders próximos, evitando loop infinito quando usado como queryKey
 * em React Query (React error #185).
 *
 * O bucket muda quando: o preset/custom muda OU passamos pra hora seguinte UTC.
 */
export function useAnalyticsRange(): { from: string; to: string; preset: RangePreset } {
  const preset = useRange((s) => s.preset)
  const customFrom = useRange((s) => s.customFrom)
  const customTo = useRange((s) => s.customTo)

  // Anchor: topo da hora UTC atual. Reduz "now" para granularidade horária.
  const hourBucket = useMemo(() => {
    const now = new Date()
    now.setUTCMinutes(0, 0, 0)
    return now.getTime()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return useMemo(() => {
    const to = preset === 'custom' && customTo ? new Date(customTo) : new Date(hourBucket)
    let from: Date
    switch (preset) {
      case '24h': from = new Date(to.getTime() - 24 * 3_600_000); break
      case '7d':  from = new Date(to.getTime() - 7 * 86_400_000); break
      case '30d': from = new Date(to.getTime() - 30 * 86_400_000); break
      case '90d': from = new Date(to.getTime() - 90 * 86_400_000); break
      case 'custom':
        from = customFrom ? new Date(customFrom) : new Date(to.getTime() - 30 * 86_400_000)
        break
    }
    return { from: from.toISOString(), to: to.toISOString(), preset }
  }, [preset, customFrom, customTo, hourBucket])
}
