import { test, expect } from '@playwright/test'

test('redireciona / para /login quando não autenticado', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByText('Entrar no backoffice')).toBeVisible()
})

test('login com credenciais corretas leva ao dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('admin@aumaf.com.br')
  await page.getByLabel('Senha').fill('AumafAdmin2026!')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByText('Posts publicados')).toBeVisible({ timeout: 10_000 })
})

test('login com senha errada mostra mensagem genérica', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('admin@aumaf.com.br')
  await page.getByLabel('Senha').fill('senha-errada')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page.getByRole('alert')).toContainText('Credenciais inválidas')
  await expect(page).toHaveURL(/\/login$/)
})
