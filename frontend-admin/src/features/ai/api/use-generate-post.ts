import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type { GeneratePostInput, GeneratePostOutput } from '@aumaf/shared'

export function useGeneratePost() {
  return useMutation({
    mutationFn: async (input: GeneratePostInput) => {
      const { data } = await apiClient.post<ApiSuccess<GeneratePostOutput>>(
        '/ai/generate-post',
        input,
        { timeout: 95_000 },
      )
      return data.data
    },
  })
}
