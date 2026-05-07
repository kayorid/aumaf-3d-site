import { describe, it, expect, vi, beforeEach } from 'vitest'
import { waitFor, act } from '@testing-library/react'
import { renderHookWithQuery } from '@/test/test-utils'

vi.mock('./integrations.api', () => ({
  integrationsApi: {
    getBotyio: vi.fn(),
    updateBotyio: vi.fn(),
    testBotyio: vi.fn(),
    getDeliveries: vi.fn(),
  },
}))

import { integrationsApi } from './integrations.api'
import {
  useBotyioConfig,
  useUpdateBotyioConfig,
  useTestBotyio,
  useBotyioDeliveries,
  BOTYIO_CONFIG_KEY,
} from './use-botyio-config'

const mocked = integrationsApi as unknown as {
  getBotyio: ReturnType<typeof vi.fn>
  updateBotyio: ReturnType<typeof vi.fn>
  testBotyio: ReturnType<typeof vi.fn>
  getDeliveries: ReturnType<typeof vi.fn>
}

const baseDto = {
  enabled: false,
  baseUrl: 'https://api.botyio.com',
  apiKey: { masked: '', isSet: false, updatedAt: null, updatedBy: null },
  webhookSecret: { masked: '', isSet: false, updatedAt: null, updatedBy: null },
  callbackUrl: 'http://localhost:3000/api/v1/leads/botyio-status',
  baseUrlUpdatedAt: null,
  enabledUpdatedAt: null,
}

describe('use-botyio-config hooks', () => {
  beforeEach(() => {
    Object.values(mocked).forEach((fn) => fn.mockReset())
  })

  it('useBotyioConfig retorna o DTO atual', async () => {
    mocked.getBotyio.mockResolvedValue(baseDto)
    const { result } = renderHookWithQuery(() => useBotyioConfig())
    await waitFor(() => expect(result.current.data).toEqual(baseDto))
  })

  it('useUpdateBotyioConfig atualiza cache local em onSuccess', async () => {
    mocked.getBotyio.mockResolvedValue(baseDto)
    const updated = { ...baseDto, enabled: true }
    mocked.updateBotyio.mockResolvedValue(updated)

    const { result, queryClient } = renderHookWithQuery(() => ({
      cfg: useBotyioConfig(),
      mut: useUpdateBotyioConfig(),
    }))

    await waitFor(() => expect(result.current.cfg.data).toEqual(baseDto))
    await act(async () => {
      await result.current.mut.mutateAsync({ enabled: true })
    })

    expect(queryClient.getQueryData(BOTYIO_CONFIG_KEY)).toEqual(updated)
  })

  it('useTestBotyio passa o input ao API client', async () => {
    mocked.testBotyio.mockResolvedValue({ ok: true, status: 200, message: 'ok', latencyMs: 50 })

    const { result } = renderHookWithQuery(() => useTestBotyio())
    await act(async () => {
      await result.current.mutateAsync({ apiKey: 'bty_lds_test' })
    })
    expect(mocked.testBotyio).toHaveBeenCalledWith({ apiKey: 'bty_lds_test' })
  })

  it('useBotyioDeliveries respeita o limit', async () => {
    mocked.getDeliveries.mockResolvedValue([])
    const { result } = renderHookWithQuery(() => useBotyioDeliveries(5))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocked.getDeliveries).toHaveBeenCalledWith(5)
  })
})
