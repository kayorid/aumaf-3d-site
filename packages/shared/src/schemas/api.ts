import { z } from 'zod'

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ status: z.literal('ok'), data })

export const ApiErrorSchema = z.object({
  status: z.literal('error'),
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
})
export type ApiError = z.infer<typeof ApiErrorSchema>
