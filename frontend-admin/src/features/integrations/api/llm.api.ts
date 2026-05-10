import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type {
  LLMConfigDto,
  UpdateLLMConfigInput,
  TestLLMConnectionInput,
  LLMTestResult,
} from '@template/shared'

const BASE = '/admin/integrations/llm'

export const llmApi = {
  async get() {
    const { data } = await apiClient.get<ApiSuccess<LLMConfigDto>>(BASE)
    return data.data
  },
  async update(input: UpdateLLMConfigInput) {
    const { data } = await apiClient.put<ApiSuccess<LLMConfigDto>>(BASE, input)
    return data.data
  },
  async test(input: TestLLMConnectionInput) {
    const { data } = await apiClient.post<LLMTestResult>(`${BASE}/test`, input)
    return data
  },
}
