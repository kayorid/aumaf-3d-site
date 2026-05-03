import { test, expect, type APIRequestContext } from '@playwright/test'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'

async function loginAndGetCookie(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
    data: { email: 'admin@aumaf.com.br', password: 'AumafAdmin2026!' },
  })
  expect(res.status()).toBe(200)
  const setCookie = res.headers()['set-cookie']
  if (!setCookie) throw new Error('Backend did not set auth cookie')
  return setCookie
}

test.describe('Posts — criar e publicar via API + visualização pública', () => {
  test('post publicado fica acessível via API pública pelo slug', async ({ request }) => {
    const cookie = await loginAndGetCookie(request)
    const stamp = Date.now()
    const slug = `e2e-post-${stamp}`

    const create = await request.post(`${BACKEND_URL}/api/v1/posts`, {
      headers: { cookie },
      data: {
        title: `E2E Post ${stamp}`,
        slug,
        content: '# Título\n\nParágrafo de teste.\n',
        status: 'PUBLISHED',
        generatedByAi: false,
      },
    })
    expect(create.status()).toBe(201)
    const post = (await create.json()) as { data: { id: string; slug: string; status: string } }
    expect(post.data.status).toBe('PUBLISHED')

    const fromPublic = await request.get(`${BACKEND_URL}/api/v1/public/posts/${slug}`)
    expect(fromPublic.status()).toBe(200)
    const body = (await fromPublic.json()) as { data: { slug: string; title: string } }
    expect(body.data.slug).toBe(slug)
    expect(body.data.title).toContain('E2E Post')

    await request.delete(`${BACKEND_URL}/api/v1/posts/${post.data.id}`, { headers: { cookie } })
  })

  test('rascunho NÃO é acessível na rota pública', async ({ request }) => {
    const cookie = await loginAndGetCookie(request)
    const stamp = Date.now()
    const slug = `e2e-draft-${stamp}`

    const create = await request.post(`${BACKEND_URL}/api/v1/posts`, {
      headers: { cookie },
      data: {
        title: `E2E Draft ${stamp}`,
        slug,
        content: 'rascunho',
        status: 'DRAFT',
        generatedByAi: false,
      },
    })
    expect(create.status()).toBe(201)
    const post = (await create.json()) as { data: { id: string } }

    const fromPublic = await request.get(`${BACKEND_URL}/api/v1/public/posts/${slug}`)
    expect(fromPublic.status()).toBe(404)

    await request.delete(`${BACKEND_URL}/api/v1/posts/${post.data.id}`, { headers: { cookie } })
  })

  test('publishPost transiciona DRAFT para PUBLISHED', async ({ request }) => {
    const cookie = await loginAndGetCookie(request)
    const stamp = Date.now()

    const create = await request.post(`${BACKEND_URL}/api/v1/posts`, {
      headers: { cookie },
      data: {
        title: `E2E Publish ${stamp}`,
        slug: `e2e-publish-${stamp}`,
        content: 'conteúdo',
        status: 'DRAFT',
        generatedByAi: false,
      },
    })
    const created = (await create.json()) as { data: { id: string } }

    const publish = await request.post(`${BACKEND_URL}/api/v1/posts/${created.data.id}/publish`, {
      headers: { cookie },
    })
    expect(publish.status()).toBe(200)
    const published = (await publish.json()) as { data: { status: string; publishedAt: string } }
    expect(published.data.status).toBe('PUBLISHED')
    expect(published.data.publishedAt).toBeTruthy()

    await request.delete(`${BACKEND_URL}/api/v1/posts/${created.data.id}`, { headers: { cookie } })
  })
})
