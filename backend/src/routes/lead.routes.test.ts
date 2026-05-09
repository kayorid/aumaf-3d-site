import request from 'supertest'
import { sign } from 'jsonwebtoken'
import { createApp } from '../app'

jest.mock('../workers/lead-notification.worker', () => ({
  enqueueLeadNotification: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('../workers/botyio-lead-sync.worker', () => ({
  enqueueBotyioLeadSync: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    userPermission: { findMany: jest.fn().mockResolvedValue([]) },
    lead: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
    leadNote: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require('../lib/prisma')
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

const sampleLead = {
  id: 'lead-1',
  name: 'Kayo',
  email: 'k@example.com',
  phone: '11999999999',
  message: 'oi',
  source: 'site',
  createdAt: new Date('2026-05-09T12:00:00Z'),
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
  referrer: null,
  landingPage: null,
  botyoStatus: null,
  deletedAt: null,
}

describe('GET /api/v1/leads/:id', () => {
  beforeEach(() => jest.clearAllMocks())

  it('retorna detalhe com notas ordenadas desc', async () => {
    prisma.lead.findFirst.mockResolvedValue({
      ...sampleLead,
      notes: [
        {
          id: 'n1',
          leadId: 'lead-1',
          authorId: 'u1',
          body: 'Primeira',
          createdAt: new Date('2026-05-09T13:00:00Z'),
          updatedAt: new Date('2026-05-09T13:00:00Z'),
          author: { name: 'Admin' },
        },
      ],
    })
    const app = createApp()
    const res = await request(app)
      .get('/api/v1/leads/lead-1')
      .set('Cookie', authCookie('ADMIN'))
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('lead-1')
    expect(res.body.data.notes).toHaveLength(1)
    expect(res.body.data.notes[0].authorName).toBe('Admin')
  })

  it('retorna 404 quando lead deletado', async () => {
    prisma.lead.findFirst.mockResolvedValue(null)
    const app = createApp()
    const res = await request(app)
      .get('/api/v1/leads/lead-x')
      .set('Cookie', authCookie('ADMIN'))
    expect(res.status).toBe(404)
  })

  it('exige autenticação', async () => {
    const app = createApp()
    const res = await request(app).get('/api/v1/leads/lead-1')
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/v1/leads/:id', () => {
  beforeEach(() => jest.clearAllMocks())

  it('soft delete bem-sucedido com ADMIN', async () => {
    prisma.lead.updateMany.mockResolvedValue({ count: 1 })
    const app = createApp()
    const res = await request(app)
      .delete('/api/v1/leads/lead-1')
      .set('Cookie', authCookie('ADMIN'))
    expect(res.status).toBe(200)
    expect(prisma.lead.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'lead-1', deletedAt: null },
        data: expect.objectContaining({ deletedBy: 'u1' }),
      }),
    )
  })

  it('MARKETING não pode deletar', async () => {
    const app = createApp()
    const res = await request(app)
      .delete('/api/v1/leads/lead-1')
      .set('Cookie', authCookie('MARKETING'))
    expect(res.status).toBe(403)
  })

  it('404 quando lead não existe ou já deletado', async () => {
    prisma.lead.updateMany.mockResolvedValue({ count: 0 })
    const app = createApp()
    const res = await request(app)
      .delete('/api/v1/leads/lead-x')
      .set('Cookie', authCookie('ADMIN'))
    expect(res.status).toBe(404)
  })
})

describe('POST /api/v1/leads/:id/notes', () => {
  beforeEach(() => jest.clearAllMocks())

  it('cria anotação', async () => {
    prisma.lead.findFirst.mockResolvedValue({ id: 'lead-1' })
    prisma.leadNote.create.mockResolvedValue({
      id: 'n1',
      leadId: 'lead-1',
      authorId: 'u1',
      body: 'Ligar amanhã',
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { name: 'Admin' },
    })
    const app = createApp()
    const res = await request(app)
      .post('/api/v1/leads/lead-1/notes')
      .set('Cookie', authCookie('ADMIN'))
      .send({ body: 'Ligar amanhã' })
    expect(res.status).toBe(201)
    expect(res.body.data.body).toBe('Ligar amanhã')
  })

  it('valida body vazio', async () => {
    const app = createApp()
    const res = await request(app)
      .post('/api/v1/leads/lead-1/notes')
      .set('Cookie', authCookie('ADMIN'))
      .send({ body: '' })
    expect([400, 422]).toContain(res.status)
  })

  it('404 quando lead deletado', async () => {
    prisma.lead.findFirst.mockResolvedValue(null)
    const app = createApp()
    const res = await request(app)
      .post('/api/v1/leads/lead-x/notes')
      .set('Cookie', authCookie('ADMIN'))
      .send({ body: 'x' })
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/v1/leads/:id/notes/:noteId', () => {
  beforeEach(() => jest.clearAllMocks())

  it('autor pode editar a própria nota', async () => {
    prisma.leadNote.findUnique.mockResolvedValue({ id: 'n1', authorId: 'u1', leadId: 'lead-1' })
    prisma.leadNote.update.mockResolvedValue({
      id: 'n1',
      leadId: 'lead-1',
      authorId: 'u1',
      body: 'edit',
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { name: 'User' },
    })
    const app = createApp()
    const res = await request(app)
      .patch('/api/v1/leads/lead-1/notes/n1')
      .set('Cookie', authCookie('MARKETING', 'u1'))
      .send({ body: 'edit' })
    expect(res.status).toBe(200)
  })

  it('não-autor MARKETING não pode editar nota de outro', async () => {
    prisma.leadNote.findUnique.mockResolvedValue({ id: 'n1', authorId: 'someone-else', leadId: 'lead-1' })
    const app = createApp()
    const res = await request(app)
      .patch('/api/v1/leads/lead-1/notes/n1')
      .set('Cookie', authCookie('MARKETING', 'u1'))
      .send({ body: 'edit' })
    expect(res.status).toBe(403)
  })

  it('ADMIN pode editar qualquer nota', async () => {
    prisma.leadNote.findUnique.mockResolvedValue({ id: 'n1', authorId: 'someone-else', leadId: 'lead-1' })
    prisma.leadNote.update.mockResolvedValue({
      id: 'n1',
      leadId: 'lead-1',
      authorId: 'someone-else',
      body: 'edit',
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { name: 'Other' },
    })
    const app = createApp()
    const res = await request(app)
      .patch('/api/v1/leads/lead-1/notes/n1')
      .set('Cookie', authCookie('ADMIN', 'admin-1'))
      .send({ body: 'edit' })
    expect(res.status).toBe(200)
  })
})

describe('DELETE /api/v1/leads/:id/notes/:noteId', () => {
  beforeEach(() => jest.clearAllMocks())

  it('autor pode excluir', async () => {
    prisma.leadNote.findUnique.mockResolvedValue({ id: 'n1', authorId: 'u1', leadId: 'lead-1' })
    prisma.leadNote.delete.mockResolvedValue({})
    const app = createApp()
    const res = await request(app)
      .delete('/api/v1/leads/lead-1/notes/n1')
      .set('Cookie', authCookie('MARKETING', 'u1'))
    expect(res.status).toBe(200)
  })

  it('não-autor não-admin recebe 403', async () => {
    prisma.leadNote.findUnique.mockResolvedValue({ id: 'n1', authorId: 'other', leadId: 'lead-1' })
    const app = createApp()
    const res = await request(app)
      .delete('/api/v1/leads/lead-1/notes/n1')
      .set('Cookie', authCookie('MARKETING', 'u1'))
    expect(res.status).toBe(403)
  })
})
