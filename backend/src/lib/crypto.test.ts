import { mkdtempSync, writeFileSync, chmodSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'

const ORIGINAL_ENV = { ...process.env }

function resetModules() {
  jest.resetModules()
}

async function loadCryptoWithEnv(overrides: Record<string, string | undefined>) {
  resetModules()
  process.env = { ...ORIGINAL_ENV, ...overrides }
  for (const k of Object.keys(overrides)) if (overrides[k] === undefined) delete process.env[k]
  return import('./crypto')
}

describe('crypto', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'aumaf-crypto-'))
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
    process.env = { ...ORIGINAL_ENV }
  })

  it('encrypta e decifra roundtrip preservando o plaintext', async () => {
    const { encryptValue, decryptValue, __resetMasterKeyCache } = await loadCryptoWithEnv({
      NODE_ENV: 'test',
      MASTER_KEY_PATH: join(tmpDir, 'absent.key'),
      MASTER_ENCRYPTION_KEY: undefined,
    })
    __resetMasterKeyCache()

    const plain = 'bty_lds_supersecret_value_42'
    const encrypted = encryptValue(plain)
    expect(encrypted.iv.length).toBe(12)
    expect(encrypted.authTag.length).toBe(16)
    expect(encrypted.ciphertext.length).toBe(plain.length)
    expect(decryptValue(encrypted)).toBe(plain)
  })

  it('gera IV único a cada encryptValue', async () => {
    const { encryptValue, __resetMasterKeyCache } = await loadCryptoWithEnv({
      NODE_ENV: 'test',
      MASTER_KEY_PATH: join(tmpDir, 'absent.key'),
    })
    __resetMasterKeyCache()

    const a = encryptValue('mesmo-valor')
    const b = encryptValue('mesmo-valor')
    expect(a.iv.equals(b.iv)).toBe(false)
    expect(a.ciphertext.equals(b.ciphertext)).toBe(false)
  })

  it('rejeita authTag adulterada com CryptoIntegrityError', async () => {
    const { encryptValue, decryptValue, CryptoIntegrityError, __resetMasterKeyCache } = await loadCryptoWithEnv({
      NODE_ENV: 'test',
      MASTER_KEY_PATH: join(tmpDir, 'absent.key'),
    })
    __resetMasterKeyCache()

    const enc = encryptValue('hello world')
    const tampered = { ...enc, authTag: Buffer.from(enc.authTag) }
    tampered.authTag[0] ^= 0xff
    expect(() => decryptValue(tampered)).toThrow(CryptoIntegrityError)
  })

  it('rejeita IV de tamanho inválido', async () => {
    const { encryptValue, decryptValue, CryptoIntegrityError, __resetMasterKeyCache } = await loadCryptoWithEnv({
      NODE_ENV: 'test',
      MASTER_KEY_PATH: join(tmpDir, 'absent.key'),
    })
    __resetMasterKeyCache()

    const enc = encryptValue('hello')
    expect(() =>
      decryptValue({ ...enc, iv: Buffer.alloc(8) }),
    ).toThrow(CryptoIntegrityError)
  })

  it('aceita MASTER_ENCRYPTION_KEY base64 em desenvolvimento', async () => {
    const key = randomBytes(32).toString('base64')
    const { encryptValue, decryptValue, __resetMasterKeyCache } = await loadCryptoWithEnv({
      NODE_ENV: 'development',
      MASTER_KEY_PATH: join(tmpDir, 'absent.key'),
      MASTER_ENCRYPTION_KEY: key,
    })
    __resetMasterKeyCache()

    const enc = encryptValue('dev-secret')
    expect(decryptValue(enc)).toBe('dev-secret')
  })

  it('lê master key do arquivo quando presente', async () => {
    const path = join(tmpDir, 'master.key')
    writeFileSync(path, randomBytes(32))
    chmodSync(path, 0o600)

    const { encryptValue, decryptValue, __resetMasterKeyCache } = await loadCryptoWithEnv({
      NODE_ENV: 'development',
      MASTER_KEY_PATH: path,
    })
    __resetMasterKeyCache()

    const enc = encryptValue('from-file')
    expect(decryptValue(enc)).toBe('from-file')
  })

  it('rejeita master key com tamanho diferente de 32 bytes', async () => {
    const path = join(tmpDir, 'short.key')
    writeFileSync(path, randomBytes(16))
    chmodSync(path, 0o600)

    const { loadMasterKey, MasterKeyError, __resetMasterKeyCache } = await loadCryptoWithEnv({
      NODE_ENV: 'development',
      MASTER_KEY_PATH: path,
    })
    __resetMasterKeyCache()

    expect(() => loadMasterKey()).toThrow(MasterKeyError)
  })

  it('mascara segredos preservando últimos 4 chars', async () => {
    const { maskSecret, lastFourOf } = await loadCryptoWithEnv({
      NODE_ENV: 'test',
      MASTER_KEY_PATH: join(tmpDir, 'absent.key'),
    })
    expect(maskSecret('bty_lds_xxxxxxxxxxxxabcd')).toMatch(/^•+abcd$/)
    expect(maskSecret('abcd')).toBe('••••')
    expect(maskSecret('')).toBe('')
    expect(lastFourOf('bty_lds_xxxxabcd')).toBe('abcd')
    expect(lastFourOf('abc')).toBe('abc')
  })
})
