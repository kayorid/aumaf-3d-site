import { prisma } from './prisma'
import { logger } from '../config/logger'
import { env } from '../config/env'
import { encryptValue, lastFourOf } from './crypto'
import { BOTYIO_PROVIDER, BOTYIO_KEYS } from '../services/integration-config.service'

interface SeedSpec {
  provider: string
  key: string
  value: string | undefined
  isSensitive: boolean
}

/**
 * Popula `integration_secrets` a partir das envs apenas quando uma row ainda não existir.
 * Idempotente: rodar várias vezes nunca sobrescreve nem duplica.
 *
 * Esta função é o "fallback de bootstrap" descrito em R9 — após o primeiro boot, todas
 * as edições devem passar pelo admin (HTTP PUT), e o env vira apenas histórico.
 */
export async function bootstrapIntegrationSecretsFromEnv(): Promise<{
  seeded: number
  skipped: number
}> {
  const seeds: SeedSpec[] = [
    {
      provider: BOTYIO_PROVIDER,
      key: BOTYIO_KEYS.BASE_URL,
      value: env.BOTYIO_BASE_URL,
      isSensitive: false,
    },
    {
      provider: BOTYIO_PROVIDER,
      key: BOTYIO_KEYS.API_KEY,
      value: env.BOTYIO_API_KEY ?? undefined,
      isSensitive: true,
    },
    {
      provider: BOTYIO_PROVIDER,
      key: BOTYIO_KEYS.WEBHOOK_SECRET,
      value: env.BOTYIO_WEBHOOK_SECRET ?? undefined,
      isSensitive: true,
    },
    {
      provider: BOTYIO_PROVIDER,
      key: BOTYIO_KEYS.ENABLED,
      value: env.BOTYIO_ENABLED,
      isSensitive: false,
    },
  ]

  let seeded = 0
  let skipped = 0

  for (const spec of seeds) {
    if (!spec.value) {
      skipped++
      continue
    }
    const existing = await prisma.integrationSecret.findUnique({
      where: { provider_key: { provider: spec.provider, key: spec.key } },
      select: { id: true },
    })
    if (existing) {
      skipped++
      continue
    }
    const enc = encryptValue(spec.value)
    await prisma.integrationSecret.create({
      data: {
        provider: spec.provider,
        key: spec.key,
        ciphertext: enc.ciphertext,
        iv: enc.iv,
        authTag: enc.authTag,
        isSensitive: spec.isSensitive,
        lastFour: spec.isSensitive ? lastFourOf(spec.value) : null,
        updatedBy: 'bootstrap',
      },
    })
    seeded++
    logger.info(
      { tag: 'bootstrap:integration-secret', provider: spec.provider, key: spec.key },
      'Credencial semeada a partir de env (bootstrap)',
    )
  }

  if (seeded > 0) {
    logger.info({ seeded, skipped }, 'Bootstrap de integration secrets concluído')
  } else {
    logger.debug({ seeded, skipped }, 'Nenhum bootstrap necessário — DB já populado ou envs ausentes')
  }

  return { seeded, skipped }
}
