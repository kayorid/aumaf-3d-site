import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { renderHook, type RenderHookOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    // Handlers vazios evitam que vitest trate erros esperados como unhandled.
    queryCache: new QueryCache({ onError: () => {} }),
    mutationCache: new MutationCache({ onError: () => {} }),
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY, staleTime: 0 },
      mutations: { retry: false },
    },
  })
}

export function withQueryClient(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

export function renderWithQuery(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient },
) {
  const client = options?.queryClient ?? createTestQueryClient()
  return {
    queryClient: client,
    ...render(ui, { wrapper: withQueryClient(client), ...options }),
  }
}

export function renderHookWithQuery<R, P>(
  callback: (props: P) => R,
  options?: Omit<RenderHookOptions<P>, 'wrapper'> & { queryClient?: QueryClient },
) {
  const client = options?.queryClient ?? createTestQueryClient()
  return {
    queryClient: client,
    ...renderHook(callback, { wrapper: withQueryClient(client), ...options }),
  }
}
