import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'
import { logger } from '../config/logger'

export function normalizePhoneBR(raw: string | undefined): string | undefined {
  if (!raw) return undefined

  const clean = raw.replace(/\D/g, '')

  // Tenta parse direto com contexto BR
  try {
    if (isValidPhoneNumber(raw, 'BR')) {
      const parsed = parsePhoneNumber(raw, 'BR')
      const e164 = parsed.format('E.164')
      if (e164 !== raw) {
        logger.debug({ raw, normalized: e164 }, 'phone normalized')
      }
      return e164
    }
  } catch {
    // continua para fallback
  }

  // Fallback: se ≥10 dígitos limpos, tenta com +55 prefixado
  if (clean.length >= 10) {
    const withCountry = `+55${clean.startsWith('55') ? clean.slice(2) : clean}`
    try {
      if (isValidPhoneNumber(withCountry, 'BR')) {
        const parsed = parsePhoneNumber(withCountry, 'BR')
        const e164 = parsed.format('E.164')
        logger.debug({ raw, normalized: e164 }, 'phone normalized (fallback +55)')
        return e164
      }
    } catch {
      // inválido mesmo com prefixo
    }
  }

  logger.debug({ raw }, 'phone invalid — will not send to Botyio')
  return undefined
}
