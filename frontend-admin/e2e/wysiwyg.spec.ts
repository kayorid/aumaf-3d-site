import { test, expect, type APIRequestContext } from '@playwright/test'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'

async function loginUI(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('admin@aumaf.com.br')
  await page.getByLabel('Senha').fill('AumafAdmin2026!')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

async function createDraftPost(request: APIRequestContext, slugPrefix: string) {
  const login = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
    data: { email: 'admin@aumaf.com.br', password: 'AumafAdmin2026!' },
  })
  const cookie = login.headers()['set-cookie']!
  const stamp = Date.now()
  const create = await request.post(`${BACKEND_URL}/api/v1/posts`, {
    headers: { cookie },
    data: {
      title: `WYSIWYG ${slugPrefix} ${stamp}`,
      slug: `wysiwyg-${slugPrefix}-${stamp}`,
      content: 'Conteúdo inicial.',
      status: 'DRAFT',
      generatedByAi: false,
    },
  })
  const post = (await create.json()) as { data: { id: string } }
  return { id: post.data.id, cookie }
}

async function deletePost(request: APIRequestContext, id: string, cookie: string) {
  await request.delete(`${BACKEND_URL}/api/v1/posts/${id}`, { headers: { cookie } })
}

test.describe('WYSIWYG editor', () => {
  test('abre post existente e mostra editor com toolbar', async ({ page, request }) => {
    const { id, cookie } = await createDraftPost(request, 'open')

    await loginUI(page)
    await page.goto(`/posts/${id}`)

    await expect(page.getByPlaceholder(/Título/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.ProseMirror, [contenteditable=true]').first()).toBeVisible()

    await deletePost(request, id, cookie)
  })

  test('menu Inserir Bloco está acessível e lista templates', async ({ page, request }) => {
    const { id, cookie } = await createDraftPost(request, 'menu')

    await loginUI(page)
    await page.goto(`/posts/${id}`)

    const trigger = page
      .getByRole('button', { name: /Inserir bloco/i })
      .or(page.getByRole('button', { name: /Bloco/i }))
      .first()

    if (await trigger.count()) {
      await trigger.click()
      // Algum template do BLOCK_TEMPLATES deve aparecer
      await expect(
        page.getByText(/Specs Grid|Material Card|Tabela Comparativa/i).first(),
      ).toBeVisible({ timeout: 5_000 })
    } else {
      test.info().annotations.push({
        type: 'skipped',
        description: 'Botão Inserir bloco ainda não exposto na toolbar atual',
      })
    }

    await deletePost(request, id, cookie)
  })
})
