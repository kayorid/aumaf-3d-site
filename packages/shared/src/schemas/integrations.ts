import { z } from 'zod'

/**
 * Read DTO de uma credencial sensível — nunca contém valor em claro.
 * Apenas máscara, flag isSet, e metadados de auditoria.
 */
export const SecretFieldDtoSchema = z.object({
  masked: z.string(),
  isSet: z.boolean(),
  updatedAt: z.string().nullable(),
  updatedBy: z.string().nullable(),
})
export type SecretFieldDto = z.infer<typeof SecretFieldDtoSchema>

/**
 * Read DTO completo da configuração Botyio.
 * - `enabled` e `baseUrl` são exibidos em claro (não-sensíveis)
 * - `apiKey` e `webhookSecret` são SecretFieldDto (mascarados)
 * - `callbackUrl` é derivado do BACKEND_URL no servidor (read-only)
 */
export const BotyioConfigDtoSchema = z.object({
  enabled: z.boolean(),
  baseUrl: z.string().url(),
  apiKey: SecretFieldDtoSchema,
  webhookSecret: SecretFieldDtoSchema,
  callbackUrl: z.string().url(),
  baseUrlUpdatedAt: z.string().nullable(),
  enabledUpdatedAt: z.string().nullable(),
})
export type BotyioConfigDto = z.infer<typeof BotyioConfigDtoSchema>

/**
 * Update — todos os campos opcionais. Ausência = não alterar.
 * Apenas valores não vazios serão aplicados (string vazia = "não mudar").
 */
export const UpdateBotyioConfigSchema = z
  .object({
    enabled: z.boolean().optional(),
    baseUrl: z.string().url().optional(),
    apiKey: z.string().min(8, 'API key deve ter ao menos 8 caracteres').optional(),
    webhookSecret: z.string().min(8, 'Webhook secret deve ter ao menos 8 caracteres').optional(),
  })
  .refine(
    (data) =>
      data.enabled !== undefined ||
      data.baseUrl !== undefined ||
      data.apiKey !== undefined ||
      data.webhookSecret !== undefined,
    { message: 'Pelo menos um campo deve ser fornecido' },
  )
export type UpdateBotyioConfigInput = z.infer<typeof UpdateBotyioConfigSchema>

/**
 * Resultado do "Testar conexão" com a API Botyio.
 */
export const BotyioTestResultSchema = z.object({
  ok: z.boolean(),
  status: z.number().nullable(),
  message: z.string(),
  latencyMs: z.number(),
})
export type BotyioTestResult = z.infer<typeof BotyioTestResultSchema>

/**
 * Body opcional do endpoint de teste — permite testar uma chave nova SEM persistir.
 */
export const TestBotyioConnectionSchema = z.object({
  apiKey: z.string().min(8).optional(),
  baseUrl: z.string().url().optional(),
})
export type TestBotyioConnectionInput = z.infer<typeof TestBotyioConnectionSchema>

/**
 * Linha da tabela de últimas entregas do webhook Botyio.
 */
export const BotyioDeliveryDtoSchema = z.object({
  id: z.string(),
  deliveryId: z.string(),
  event: z.string(),
  receivedAt: z.string(),
})
export type BotyioDeliveryDto = z.infer<typeof BotyioDeliveryDtoSchema>

export const BotyioDeliveriesResponseSchema = z.object({
  status: z.literal('ok'),
  data: z.array(BotyioDeliveryDtoSchema),
})
