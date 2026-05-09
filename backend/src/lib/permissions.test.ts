import { resolvePermissions, isValidPermission, ROLE_PRESETS } from './permissions'

describe('resolvePermissions', () => {
  it('ADMIN tem todas as permissões edit (e view por implicação)', () => {
    const set = resolvePermissions('ADMIN', [])
    expect(set.has('users:edit')).toBe(true)
    expect(set.has('users:view')).toBe(true)
    expect(set.has('settings:edit')).toBe(true)
    expect(set.has('botyio:view')).toBe(true)
  })

  it('EDITOR não vê leads por padrão', () => {
    const set = resolvePermissions('EDITOR', [])
    expect(set.has('leads:view')).toBe(false)
    expect(set.has('leads:edit')).toBe(false)
    expect(set.has('posts:edit')).toBe(true)
  })

  it('MARKETING enxerga leads:edit e posts:view, sem settings/users', () => {
    const set = resolvePermissions('MARKETING', [])
    expect(set.has('leads:edit')).toBe(true)
    expect(set.has('leads:view')).toBe(true)
    expect(set.has('posts:view')).toBe(true)
    expect(set.has('posts:edit')).toBe(false)
    expect(set.has('settings:view')).toBe(false)
    expect(set.has('users:view')).toBe(false)
  })

  it('override granted=true adiciona permissão fora do preset', () => {
    const set = resolvePermissions('EDITOR', [
      { feature: 'leads', action: 'view', granted: true },
    ])
    expect(set.has('leads:view')).toBe(true)
    expect(set.has('leads:edit')).toBe(false)
  })

  it('override granted=false revoga permissão herdada do preset', () => {
    const set = resolvePermissions('EDITOR', [
      { feature: 'posts', action: 'edit', granted: false },
    ])
    expect(set.has('posts:edit')).toBe(false)
    // ainda pode ser herdada via implicação se algo a recriar — mas posts:view não vem do preset EDITOR
    // (EDITOR só tem posts:edit no preset), portanto após revogar edit, view também some
    expect(set.has('posts:view')).toBe(false)
  })

  it('override edit também concede view automaticamente', () => {
    const set = resolvePermissions('MARKETING', [
      { feature: 'settings', action: 'edit', granted: true },
    ])
    expect(set.has('settings:edit')).toBe(true)
    expect(set.has('settings:view')).toBe(true)
  })

  it('overrides inválidos são ignorados silenciosamente', () => {
    const set = resolvePermissions('ADMIN', [
      { feature: 'nope', action: 'view', granted: true },
    ])
    expect(set.has('users:edit')).toBe(true)
  })
})

describe('isValidPermission', () => {
  it('aceita combinações válidas', () => {
    expect(isValidPermission('leads:edit')).toBe(true)
    expect(isValidPermission('users:view')).toBe(true)
  })
  it('rejeita feature/action desconhecidas', () => {
    expect(isValidPermission('foo:edit')).toBe(false)
    expect(isValidPermission('leads:delete')).toBe(false)
    expect(isValidPermission('invalid')).toBe(false)
  })
})

describe('ROLE_PRESETS', () => {
  it('ADMIN inclui todas as features', () => {
    const featureSet = new Set(ROLE_PRESETS.ADMIN.map((p) => p.split(':')[0]))
    expect(featureSet.size).toBeGreaterThanOrEqual(8)
  })
})
