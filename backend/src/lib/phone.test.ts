import { normalizePhoneBR } from './phone'

describe('normalizePhoneBR', () => {
  it('retorna undefined para undefined', () => {
    expect(normalizePhoneBR(undefined)).toBeUndefined()
  })

  it('retorna undefined para string vazia', () => {
    expect(normalizePhoneBR('')).toBeUndefined()
  })

  it('normaliza celular com DDD e máscara — (16) 99999-9999', () => {
    expect(normalizePhoneBR('(16) 99999-9999')).toBe('+5516999999999')
  })

  it('normaliza celular sem máscara — 16999999999', () => {
    expect(normalizePhoneBR('16999999999')).toBe('+5516999999999')
  })

  it('normaliza 9º dígito SP — (11) 9 8888-7777', () => {
    expect(normalizePhoneBR('(11) 9 8888-7777')).toBe('+5511988887777')
  })

  it('normaliza fixo RJ 8 dígitos — (21) 3333-4444', () => {
    expect(normalizePhoneBR('(21) 3333-4444')).toBe('+552133334444')
  })

  it('normaliza fixo interior 8 dígitos — (16) 3333-4444', () => {
    expect(normalizePhoneBR('(16) 3333-4444')).toBe('+551633334444')
  })

  it('aceita E.164 já formatado', () => {
    expect(normalizePhoneBR('+5516999999999')).toBe('+5516999999999')
  })

  it('retorna undefined para texto inválido', () => {
    expect(normalizePhoneBR('abc123')).toBeUndefined()
  })

  it('retorna undefined para número curto demais', () => {
    expect(normalizePhoneBR('123456')).toBeUndefined()
  })
})
