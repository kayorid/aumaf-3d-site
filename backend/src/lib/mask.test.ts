import { maskEmail, maskPhone } from './mask'

describe('maskEmail', () => {
  it('mascara local mas mantém domínio', () => {
    expect(maskEmail('joao@aumaf.com')).toBe('j***@aumaf.com')
  })

  it('lida com local de 1 char', () => {
    expect(maskEmail('a@b.com')).toBe('a***@b.com')
  })

  it('retorna intacto se inválido', () => {
    expect(maskEmail('semarroba')).toBe('semarroba')
  })
})

describe('maskPhone', () => {
  it('mantém apenas últimos 4 dígitos', () => {
    expect(maskPhone('11999998888')).toBe('*** ****-8888')
    expect(maskPhone('(16) 99999-8888')).toBe('*** ****-8888')
  })

  it('retorna intacto se muito curto', () => {
    expect(maskPhone('123')).toBe('123')
  })
})
