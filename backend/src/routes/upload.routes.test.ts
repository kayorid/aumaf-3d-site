import request from 'supertest'
import { sign } from 'jsonwebtoken'
import { Readable } from 'node:stream'
import { createApp } from '../app'

jest.mock('../lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    userPermission: { findMany: jest.fn().mockResolvedValue([]) },
  },
}))

jest.mock('../lib/s3-client', () => ({
  s3: { send: jest.fn() },
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require('../lib/prisma')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { s3 } = require('../lib/s3-client')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { env } = require('../config/env')

function authCookie(role: 'ADMIN' | 'MARKETING' | 'EDITOR' = 'ADMIN', userId = 'u1') {
  prisma.user.findUnique.mockResolvedValue({
    id: userId,
    email: 'u@aumaf.com.br',
    name: 'User',
    role,
    active: true,
  })
  const token = sign({ sub: userId, email: 'u@aumaf.com.br', role }, env.JWT_SECRET, { expiresIn: '1h' })
  return `aumaf_session=${token}`
}

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])

describe('POST /api/v1/uploads/file', () => {
  beforeEach(() => jest.clearAllMocks())

  it('aceita PNG válido e devolve key + publicUrl no novo formato', async () => {
    s3.send.mockResolvedValue({})
    const app = createApp()
    const res = await request(app)
      .post('/api/v1/uploads/file?filename=foo.png')
      .set('Cookie', authCookie('ADMIN'))
      .set('Content-Type', 'image/png')
      .send(PNG_HEADER)
    expect(res.status).toBe(201)
    expect(res.body.status).toBe('ok')
    expect(res.body.data.contentType).toBe('image/png')
    expect(res.body.data.key).toMatch(/^posts\/[0-9a-f-]+-foo\.png$/)
    expect(res.body.data.publicUrl).toMatch(/\/api\/v1\/files\/posts\//)
    expect(s3.send).toHaveBeenCalledTimes(1)
  })

  it('rejeita Content-Type não suportado', async () => {
    const app = createApp()
    const res = await request(app)
      .post('/api/v1/uploads/file?filename=foo.gif')
      .set('Cookie', authCookie('ADMIN'))
      .set('Content-Type', 'image/gif')
      .send(PNG_HEADER)
    expect(res.status).toBe(400)
  })

  it('exige autenticação', async () => {
    const app = createApp()
    const res = await request(app)
      .post('/api/v1/uploads/file?filename=foo.png')
      .set('Content-Type', 'image/png')
      .send(PNG_HEADER)
    expect(res.status).toBe(401)
  })

  it('safeFilename remove caracteres perigosos', async () => {
    s3.send.mockResolvedValue({})
    const app = createApp()
    const res = await request(app)
      .post('/api/v1/uploads/file?filename=../../etc/passwd.png')
      .set('Cookie', authCookie('ADMIN'))
      .set('Content-Type', 'image/png')
      .send(PNG_HEADER)
    expect(res.status).toBe(201)
    // Path separators removidos; nada de /etc/ ou /
    expect(res.body.data.key).not.toMatch(/\/etc\//)
    expect(res.body.data.key.replace(/^posts\//, '')).not.toContain('/')
  })
})

describe('GET /api/v1/files/:key (público)', () => {
  beforeEach(() => jest.clearAllMocks())

  it('serve arquivo do prefixo posts/ com headers corretos', async () => {
    const stream = Readable.from(PNG_HEADER)
    s3.send.mockResolvedValue({
      ContentType: 'image/png',
      ContentLength: PNG_HEADER.byteLength,
      ETag: '"abc"',
      Body: stream,
    })
    const app = createApp()
    const res = await request(app).get('/api/v1/files/posts/some-key.png')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toBe('image/png')
    expect(res.headers['cache-control']).toContain('immutable')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it('retorna 404 para chave fora do prefixo permitido', async () => {
    const app = createApp()
    const res = await request(app).get('/api/v1/files/secrets/passwd')
    expect(res.status).toBe(404)
    expect(s3.send).not.toHaveBeenCalled()
  })

  it('mapeia NoSuchKey do S3 para 404', async () => {
    const err = Object.assign(new Error('not found'), { name: 'NoSuchKey' })
    s3.send.mockRejectedValue(err)
    const app = createApp()
    const res = await request(app).get('/api/v1/files/posts/missing.png')
    expect(res.status).toBe(404)
  })

  it('não exige autenticação (sem cookie)', async () => {
    const stream = Readable.from(PNG_HEADER)
    s3.send.mockResolvedValue({
      ContentType: 'image/png',
      ContentLength: PNG_HEADER.byteLength,
      Body: stream,
    })
    const app = createApp()
    const res = await request(app).get('/api/v1/files/posts/x.png')
    expect(res.status).toBe(200)
  })
})
