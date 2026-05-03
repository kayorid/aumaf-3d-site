import { slugify } from './slug'

describe('slugify', () => {
  it('lowercases', () => {
    expect(slugify('HELLO World')).toBe('hello-world')
  })

  it('strips Portuguese diacritics', () => {
    expect(slugify('Impressão 3D em São Carlos')).toBe('impressao-3d-em-sao-carlos')
  })

  it('handles punctuation', () => {
    expect(slugify('FDM vs SLA: o que é melhor?')).toBe('fdm-vs-sla-o-que-e-melhor')
  })

  it('removes leading/trailing hyphens', () => {
    expect(slugify('  -- hello -- ')).toBe('hello')
  })

  it('returns empty for non-alphanumeric input', () => {
    expect(slugify('???')).toBe('')
  })

  it('caps at 100 chars', () => {
    const long = 'a'.repeat(200)
    expect(slugify(long).length).toBeLessThanOrEqual(100)
  })
})
