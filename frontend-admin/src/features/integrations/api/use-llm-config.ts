import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { llmApi } from './llm.api'
import type { TestLLMConnectionInput, UpdateLLMConfigInput } from '@aumaf/shared'

export const LLM_CONFIG_KEY = ['integrations', 'llm'] as const

export function useLLMConfig() {
  return useQuery({
    queryKey: LLM_CONFIG_KEY,
    queryFn: llmApi.get,
    staleTime: 30_000,
  })
}

export function useUpdateLLMConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateLLMConfigInput) => llmApi.update(input),
    onSuccess: (data) => {
      qc.setQueryData(LLM_CONFIG_KEY, data)
    },
  })
}

export function useTestLLM() {
  return useMutation({
    mutationFn: (input: TestLLMConnectionInput) => llmApi.test(input),
  })
}
