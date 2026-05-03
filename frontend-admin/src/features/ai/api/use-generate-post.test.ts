import { describe, it, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderHookWithQuery } from '@/test/test-utils'

const postMock = vi.fn()
vi.mock('@/lib/api', () => ({
  apiClient: { post: (...args: unknown[]) => postMock(...args) },
}))

import { useGeneratePost } from './use-generate-post'

describe('useGeneratePost', () => {
  beforeEach(() => postMock.mockReset())

  it('chama /ai/generate-post e devolve payload', async () => {
    postMock.mockResolvedValue({
      data: {
        data: {
          title: 'Por que escolher PLA',
          content: '# X',
          excerpt: 'r',
          metaTitle: 'm',
          metaDescription: 'd',
          tags: ['pla'],
        },
      },
    })

    const { result } = renderHookWithQuery(() => useGeneratePost())
    result.current.mutate({
      topic: 'PLA',
      tone: 'professional',
      length: 'medium',
      provider: 'anthropic',
    } as never)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(postMock).toHaveBeenCalledWith(
      '/ai/generate-post',
      expect.objectContaining({ topic: 'PLA' }),
      expect.objectContaining({ timeout: 95_000 }),
    )
    expect(result.current.data?.title).toBe('Por que escolher PLA')
  })

  it('aplica timeout 95s na chamada axios', async () => {
    postMock.mockResolvedValue({ data: { data: { title: 't', content: 'c' } } })
    const { result } = renderHookWithQuery(() => useGeneratePost())
    result.current.mutate({ topic: 'X' } as never)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const [, , config] = postMock.mock.calls[0]
    expect(config.timeout).toBe(95_000)
  })
})
