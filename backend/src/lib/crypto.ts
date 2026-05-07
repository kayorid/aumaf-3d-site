import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { env } from '../config/env'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

let masterKey: Buffer | null = null

export class MasterKeyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MasterKeyError'
  }
}

export class CryptoIntegrityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CryptoIntegrityError'
  }
}

/**
 * Carrega a master key conforme ambiente:
 * - production: arquivo MASTER_KEY_PATH obrigatório, 32 bytes binários, modo restrito
 * - development: tenta arquivo; fallback para MASTER_ENCRYPTION_KEY (base64) se ausente
 * - test: gera key efêmera in-memory se nenhuma fonte disponível
 *
 * Em produção, qualquer falha derruba o processo (process.exit(1)) — evita fallback inseguro.
 */
export function loadMasterKey(): Buffer {
  if (masterKey) return masterKey

  const path = env.MASTER_KEY_PATH
  const envKey = env.MASTER_ENCRYPTION_KEY

  try {
    const fromFile = tryLoadFromFile(path)
    if (fromFile) {
      masterKey = fromFile
      return masterKey
    }

    if (env.NODE_ENV !== 'production' && envKey) {
      const decoded = Buffer.from(envKey, 'base64')
      if (decoded.length !== KEY_LENGTH) {
        throw new MasterKeyError(
          `MASTER_ENCRYPTION_KEY deve ter ${KEY_LENGTH} bytes (base64); recebido ${decoded.length}`,
        )
      }
      masterKey = decoded
      return masterKey
    }

    if (env.NODE_ENV === 'test') {
      masterKey = randomBytes(KEY_LENGTH)
      return masterKey
    }

    throw new MasterKeyError(
      `Master key não encontrada. Em produção, gere: 'openssl rand -out ${path} 32 && chmod 400 ${path}'.`,
    )
  } catch (err) {
    if (env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.error('[FATAL] master key indisponível em produção:', err instanceof Error ? err.message : err)
      process.exit(1)
    }
    throw err
  }
}

function tryLoadFromFile(path: string): Buffer | null {
  try {
    const stats = statSync(path)
    if (!stats.isFile()) return null

    if (env.NODE_ENV === 'production') {
      const mode = stats.mode & 0o777
      if (mode & 0o077) {
        throw new MasterKeyError(
          `Master key ${path} tem permissão ${mode.toString(8)}; esperado 0400 ou 0600. Use 'chmod 400'.`,
        )
      }
    }

    const buf = readFileSync(path)
    if (buf.length !== KEY_LENGTH) {
      throw new MasterKeyError(
        `Master key em ${path} deve ter exatamente ${KEY_LENGTH} bytes; arquivo tem ${buf.length}.`,
      )
    }
    return buf
  } catch (err) {
    if (err instanceof MasterKeyError) throw err
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return null
    throw err
  }
}

/** Reseta o cache da master key. Apenas para testes. */
export function __resetMasterKeyCache(): void {
  masterKey = null
}

export interface EncryptedPayload {
  ciphertext: Buffer
  iv: Buffer
  authTag: Buffer
}

export function encryptValue(plaintext: string): EncryptedPayload {
  if (typeof plaintext !== 'string') {
    throw new TypeError('encryptValue: plaintext deve ser string')
  }
  const key = loadMasterKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return { ciphertext, iv, authTag }
}

export function decryptValue(payload: EncryptedPayload): string {
  const key = loadMasterKey()
  if (payload.iv.length !== IV_LENGTH) {
    throw new CryptoIntegrityError(`IV inválido: esperado ${IV_LENGTH} bytes, recebido ${payload.iv.length}`)
  }
  if (payload.authTag.length !== AUTH_TAG_LENGTH) {
    throw new CryptoIntegrityError(
      `AuthTag inválida: esperado ${AUTH_TAG_LENGTH} bytes, recebido ${payload.authTag.length}`,
    )
  }
  try {
    const decipher = createDecipheriv(ALGORITHM, key, payload.iv)
    decipher.setAuthTag(payload.authTag)
    const plaintext = Buffer.concat([decipher.update(payload.ciphertext), decipher.final()])
    return plaintext.toString('utf8')
  } catch (err) {
    throw new CryptoIntegrityError(
      `Falha ao decifrar: ${err instanceof Error ? err.message : 'erro desconhecido'} — possível tampering ou rotação de master key.`,
    )
  }
}

/** Mascara um segredo deixando os últimos N visíveis. Default: 4. */
export function maskSecret(value: string, visible = 4): string {
  if (!value) return ''
  if (value.length <= visible) return '•'.repeat(value.length)
  return '•'.repeat(Math.max(8, value.length - visible)) + value.slice(-visible)
}

export function lastFourOf(value: string): string {
  return value.length <= 4 ? value : value.slice(-4)
}
