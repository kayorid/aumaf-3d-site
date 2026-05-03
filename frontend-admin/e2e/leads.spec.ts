import { test, expect } from '@playwright/test'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'

test.describe('Leads — fluxo público → admin', () => {
  test('lead criado via API pública aparece na lista do admin', async ({ page, request }) => {
    const stamp = Date.now()
    const lead = {
      name: `E2E Lead ${stamp}`,
      email: `e2e+${stamp}@example.com`,
      phone: '+5516999990000',
      message: 'Mensagem de teste E2E.',
      source: 'site-aumaf-3d',
    }

    const create = await request.post(`${BACKEND_URL}/api/v1/leads`, { data: lead })
    expect(create.status()).toBe(201)
    const created = (await create.json()) as { data: { id: string } }
    expect(created.data.id).toBeTruthy()

    await page.goto('/login')
    await page.getByLabel('E-mail').fill('admin@aumaf.com.br')
    await page.getByLabel('Senha').fill('AumafAdmin2026!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)

    await page.goto('/leads')
    await expect(page.getByText(lead.name).first()).toBeVisible({ timeout: 10_000 })
  })

  test('lead aparece mascarado no Dashboard (recentes)', async ({ page, request }) => {
    const stamp = Date.now()
    const lead = {
      name: `Dash ${stamp}`,
      email: `dash+${stamp}@example.com`,
      phone: '+5516988887777',
      source: 'site-aumaf-3d',
    }

    await request.post(`${BACKEND_URL}/api/v1/leads`, { data: lead })

    await page.goto('/login')
    await page.getByLabel('E-mail').fill('admin@aumaf.com.br')
    await page.getByLabel('Senha').fill('AumafAdmin2026!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)

    // O nome aparece, mas o contato é mascarado (telefone +5516********)
    await expect(page.getByText(lead.name).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('body')).not.toContainText('+5516988887777')
  })
})
