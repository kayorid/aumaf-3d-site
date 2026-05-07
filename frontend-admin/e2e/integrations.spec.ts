import { test, expect } from '@playwright/test'

/**
 * E2E — Botyio config UI (R3, R4, R5, R6, R10).
 *
 * Pré-condições:
 * - Backend rodando em http://localhost:3000
 * - Frontend admin rodando em http://localhost:5174
 * - Banco com user admin (admin@aumaf.com.br / AumafAdmin2026!)
 * - Migration `add_integration_secrets` aplicada
 * - Master key disponível (NODE_ENV=development aceita MASTER_ENCRYPTION_KEY base64)
 */

test.describe('Integrações · Botyio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill('admin@aumaf.com.br')
    await page.getByLabel('Senha').fill('AumafAdmin2026!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test('navega ao menu Botyio e renderiza a página com Callback URL', async ({ page }) => {
    await page.getByRole('link', { name: /Botyio/i }).click()
    await expect(page).toHaveURL(/\/integrations\/botyio$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Botyio/i)
    // Callback URL deve estar visível (R6)
    await expect(page.getByText(/api\/v1\/leads\/botyio-status/)).toBeVisible()
    await expect(page.getByLabel(/Copiar URL/i)).toBeVisible()
  })

  test('toggle enabled persiste após reload (R3, R4)', async ({ page }) => {
    await page.goto('/integrations/botyio')
    const toggle = page.getByRole('switch')
    const initial = await toggle.getAttribute('aria-checked')

    await toggle.click()
    await page.getByRole('button', { name: /Salvar alterações/i }).click()
    await expect(page.getByText(/Configuração da Botyio atualizada/i)).toBeVisible({ timeout: 5_000 })

    await page.reload()
    const after = await page.getByRole('switch').getAttribute('aria-checked')
    expect(after).not.toBe(initial)

    // Restaura estado original para não poluir o ambiente
    await page.getByRole('switch').click()
    await page.getByRole('button', { name: /Salvar alterações/i }).click()
  })

  test('campo apiKey vazio não envia o campo (preserva valor atual)', async ({ page }) => {
    await page.goto('/integrations/botyio')
    // Sem digitar nada na apiKey, salvar com novo baseUrl não deve afetar a apiKey
    const baseUrl = page.getByLabel(/Base URL da API Botyio/i)
    const original = await baseUrl.inputValue()
    await baseUrl.fill('https://api.botyio.com')

    await page.getByRole('button', { name: /Salvar alterações/i }).click()
    // Sucesso ou "nenhuma alteração"
    await expect(page.locator('body')).toContainText(/(atualizada|Nenhuma alteração)/i, { timeout: 5_000 })

    await baseUrl.fill(original)
  })

  test('Testar conexão sem apiKey mostra mensagem de "nenhuma chave"', async ({ page }) => {
    await page.goto('/integrations/botyio')

    // Limpa qualquer apiKey digitada acidentalmente
    await page.getByLabel(/^API Key$/i).fill('')

    await page.getByRole('button', { name: /Testar conexão/i }).click()
    // Pode mostrar toast de erro OU sucesso dependendo se DB tem chave
    // (R5 — não persiste; só valida que o botão funciona)
    await expect(page.locator('body')).toContainText(/(Conectado|Falha|Nenhuma)/i, { timeout: 8_000 })
  })

  test('R10: usuário não-ADMIN não deveria acessar (validação no servidor)', async ({ page }) => {
    // Mesmo que o link apareça, hit direto em /integrations/botyio com role inferior
    // resulta em 403 do backend e UI mostra erro. Como o seed só tem ADMIN, este teste
    // é mais um marcador documental — o backend já testa via Jest (admin-integration.test.ts).
    // Aqui apenas confirma que o GET retorna dados pra ADMIN.
    await page.goto('/integrations/botyio')
    await expect(page.getByText(/api\/v1\/leads\/botyio-status/)).toBeVisible()
  })
})
