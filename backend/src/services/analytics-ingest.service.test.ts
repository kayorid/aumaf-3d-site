import { anonymizeIp } from './analytics-ingest.service'

jest.mock('../config/env', () => ({
  env: {
    ANALYTICS_ENABLED: 'true',
    ANALYTICS_IP_SALT: 'test-salt',
    ANALYTICS_GEOIP_DB_PATH: undefined,
  },
}))

jest.mock('../config/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

describe('analytics-ingest.service — anonymizeIp', () => {
  it('zera último octeto de IPv4', () => {
    expect(anonymizeIp('203.0.113.42')).toBe('203.0.113.0')
    expect(anonymizeIp('10.0.0.1')).toBe('10.0.0.0')
  })

  it('mantém IPv4 com já anônimo', () => {
    expect(anonymizeIp('203.0.113.0')).toBe('203.0.113.0')
  })

  it('zera bloco final de IPv6', () => {
    const out = anonymizeIp('2001:db8:1:2:3:4:5:6')
    expect(out).toMatch(/^2001:db8:1:0:0:0:0:0$/)
  })

  it('retorna inalterado para valor não-IP', () => {
    expect(anonymizeIp('localhost')).toBe('localhost')
  })
})
