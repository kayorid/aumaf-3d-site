import { CollectBatchSchema } from '@aumaf/shared'

describe('CollectBatchSchema', () => {
  const baseEvent = {
    eventId: '00000000-0000-4000-8000-000000000001',
    occurredAt: '2026-05-12T12:00:00.000Z',
    sessionId: 'session-12345678',
    visitorId: 'visitor-12345678',
    type: 'pageview' as const,
    url: 'https://aumaf.test/',
    path: '/',
  }

  it('aceita evento mínimo válido', () => {
    const r = CollectBatchSchema.safeParse({ events: [baseEvent] })
    expect(r.success).toBe(true)
  })

  it('rejeita batch vazio', () => {
    const r = CollectBatchSchema.safeParse({ events: [] })
    expect(r.success).toBe(false)
  })

  it('rejeita batch acima de 50', () => {
    const r = CollectBatchSchema.safeParse({
      events: Array(51).fill(baseEvent).map((e, i) => ({
        ...e,
        eventId: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      })),
    })
    expect(r.success).toBe(false)
  })

  it('rejeita tipo inválido', () => {
    const r = CollectBatchSchema.safeParse({ events: [{ ...baseEvent, type: 'banana' }] })
    expect(r.success).toBe(false)
  })

  it('rejeita url malformado', () => {
    const r = CollectBatchSchema.safeParse({ events: [{ ...baseEvent, url: 'not-a-url' }] })
    expect(r.success).toBe(false)
  })

  it('aceita properties livres', () => {
    const r = CollectBatchSchema.safeParse({
      events: [{ ...baseEvent, type: 'click', name: 'cta_quote_hero', properties: { location: 'hero', count: 3 } }],
    })
    expect(r.success).toBe(true)
  })
})
