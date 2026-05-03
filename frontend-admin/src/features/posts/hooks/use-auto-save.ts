import { useEffect, useRef, useState } from 'react'
import { apiClient } from '@/lib/api'
import type { UpdatePostInput } from '@aumaf/shared'

export type AutoSaveState = 'idle' | 'saving' | 'saved' | 'error' | 'paused'

interface UseAutoSaveOptions {
  postId: string | undefined
  values: Partial<UpdatePostInput>
  /** Em ms — default 5000 */
  debounceMs?: number
  /** Pausa após N falhas consecutivas — default 3 */
  maxFailures?: number
  /** Habilita o hook (ex.: false em criação inicial) */
  enabled?: boolean
}

export interface AutoSaveStatus {
  state: AutoSaveState
  lastSavedAt: Date | null
  failureCount: number
  /** Forçar tentativa manual (ex.: após pausa) */
  retry: () => void
}

/**
 * Auto-save com debounce. Faz PATCH em /posts/:id/auto-save (ignora status).
 * Pausa após maxFailures falhas consecutivas; estado "paused" requer retry manual.
 */
export function useAutoSave({
  postId,
  values,
  debounceMs = 5000,
  maxFailures = 3,
  enabled = true,
}: UseAutoSaveOptions): AutoSaveStatus {
  const [state, setState] = useState<AutoSaveState>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [failureCount, setFailureCount] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlightRef = useRef(false)
  const stableValuesRef = useRef(values)
  stableValuesRef.current = values

  useEffect(() => {
    if (!enabled || !postId) return
    if (state === 'paused') return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      if (inFlightRef.current) return
      inFlightRef.current = true
      setState('saving')
      try {
        await apiClient.patch(`/posts/${postId}/auto-save`, stableValuesRef.current)
        setState('saved')
        setLastSavedAt(new Date())
        setFailureCount(0)
      } catch {
        setFailureCount((n) => {
          const next = n + 1
          setState(next >= maxFailures ? 'paused' : 'error')
          return next
        })
      } finally {
        inFlightRef.current = false
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // values reference changes via stableValuesRef; depend on a snapshot key
  }, [postId, JSON.stringify(values), enabled, debounceMs, maxFailures, state])

  return {
    state,
    lastSavedAt,
    failureCount,
    retry: () => {
      setState('idle')
      setFailureCount(0)
    },
  }
}
