import { describe, it, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderHookWithQuery } from '@/test/test-utils'

vi.mock('./posts.api', () => ({
  postsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
  },
  categoriesApi: { list: vi.fn() },
}))

vi.mock('@/features/dashboard/api/use-metrics', () => ({
  DASHBOARD_QUERY_KEY: ['dashboard'],
}))

import { postsApi } from './posts.api'
import {
  usePosts,
  usePost,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  usePublishPost,
} from './use-posts'

const mocked = postsApi as unknown as {
  list: ReturnType<typeof vi.fn>
  get: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  publish: ReturnType<typeof vi.fn>
  unpublish: ReturnType<typeof vi.fn>
}

describe('use-posts hooks', () => {
  beforeEach(() => {
    Object.values(mocked).forEach((fn) => fn.mockReset())
  })

  it('usePosts retorna lista paginada', async () => {
    mocked.list.mockResolvedValue({
      data: [{ id: 'p1', title: 'A', slug: 'a' }],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    })

    const { result } = renderHookWithQuery(() => usePosts({ page: 1 }))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.data[0].id).toBe('p1')
    expect(mocked.list).toHaveBeenCalledWith({ page: 1 })
  })

  it('usePost desabilita query quando id ausente', () => {
    const { result } = renderHookWithQuery(() => usePost(undefined))
    expect(result.current.fetchStatus).toBe('idle')
    expect(mocked.get).not.toHaveBeenCalled()
  })

  it('usePost busca quando id presente', async () => {
    mocked.get.mockResolvedValue({ id: 'p1', title: 'A' })
    const { result } = renderHookWithQuery(() => usePost('p1'))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocked.get).toHaveBeenCalledWith('p1')
  })

  it('useCreatePost chama postsApi.create', async () => {
    mocked.create.mockResolvedValue({ id: 'new', title: 'X', slug: 'x' })
    const { result } = renderHookWithQuery(() => useCreatePost())
    result.current.mutate({
      title: 'X',
      slug: 'x',
      content: 'c',
      status: 'DRAFT',
      generatedByAi: false,
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocked.create).toHaveBeenCalled()
  })

  it('useUpdatePost atualiza cache de detalhe ao concluir', async () => {
    mocked.update.mockResolvedValue({ id: 'p1', title: 'Updated' })
    const { result, queryClient } = renderHookWithQuery(() => useUpdatePost('p1'))
    result.current.mutate({ title: 'Updated' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(['posts', 'detail', 'p1'])).toMatchObject({ title: 'Updated' })
  })

  it('useDeletePost dispara delete', async () => {
    mocked.delete.mockResolvedValue(undefined)
    const { result } = renderHookWithQuery(() => useDeletePost())
    result.current.mutate('p9')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocked.delete).toHaveBeenCalledWith('p9')
  })

  it('usePublishPost atualiza cache de detalhe', async () => {
    mocked.publish.mockResolvedValue({ id: 'p1', status: 'PUBLISHED' })
    const { result, queryClient } = renderHookWithQuery(() => usePublishPost())
    result.current.mutate('p1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(['posts', 'detail', 'p1'])).toMatchObject({ status: 'PUBLISHED' })
  })

  it('lida com erro de mutation sem retry', async () => {
    mocked.create.mockRejectedValue(new Error('boom'))
    const { result } = renderHookWithQuery(() => useCreatePost())
    const onError = vi.fn()
    result.current.mutate(
      { title: 'X', slug: 'x', content: 'c', status: 'DRAFT', generatedByAi: false },
      { onError },
    )
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(onError).toHaveBeenCalled()
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
