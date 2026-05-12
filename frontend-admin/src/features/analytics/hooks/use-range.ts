import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RangePreset = '24h' | '7d' | '30d' | '90d' | 'custom'

interface RangeState {
  preset: RangePreset
  customFrom: string | null
  customTo: string | null
  setPreset: (p: RangePreset) => void
  setCustom: (from: string, to: string) => void
  range: () => { from: string; to: string; preset: RangePreset }
}

function rangeFor(preset: RangePreset, customFrom: string | null, customTo: string | null) {
  const now = new Date()
  const to = preset === 'custom' && customTo ? new Date(customTo) : now
  let from: Date
  switch (preset) {
    case '24h': from = new Date(now.getTime() - 24 * 3_600_000); break
    case '7d':  from = new Date(now.getTime() - 7 * 86_400_000); break
    case '30d': from = new Date(now.getTime() - 30 * 86_400_000); break
    case '90d': from = new Date(now.getTime() - 90 * 86_400_000); break
    case 'custom':
      from = customFrom ? new Date(customFrom) : new Date(now.getTime() - 30 * 86_400_000)
      break
  }
  return { from: from.toISOString(), to: to.toISOString(), preset }
}

export const useRange = create<RangeState>()(
  persist(
    (set, get) => ({
      preset: '30d',
      customFrom: null,
      customTo: null,
      setPreset: (preset) => set({ preset }),
      setCustom: (customFrom, customTo) => set({ customFrom, customTo, preset: 'custom' }),
      range: () => rangeFor(get().preset, get().customFrom, get().customTo),
    }),
    { name: 'aumaf-analytics-range' },
  ),
)
