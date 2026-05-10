import { Router } from 'express'
import {
  MediaListQuerySchema,
  RegisterMediaInputSchema,
  UpdateMediaInputSchema,
} from '@template/shared'
import { requireAuth } from '../middlewares/require-auth'
import {
  deleteMedia,
  listMedia,
  registerMedia,
  updateMedia,
} from '../services/media.service'

export const mediaRoutes = Router()

mediaRoutes.use(requireAuth)

mediaRoutes.get('/', async (req, res, next) => {
  try {
    const query = MediaListQuerySchema.parse(req.query)
    const result = await listMedia(query)
    res.json({ status: 'ok', data: result })
  } catch (err) {
    next(err)
  }
})

mediaRoutes.post('/', async (req, res, next) => {
  try {
    const input = RegisterMediaInputSchema.parse(req.body)
    const result = await registerMedia(input, req.user?.id ?? null)
    res.status(201).json({ status: 'ok', data: result })
  } catch (err) {
    next(err)
  }
})

mediaRoutes.patch('/:id', async (req, res, next) => {
  try {
    const input = UpdateMediaInputSchema.parse(req.body)
    const result = await updateMedia(req.params.id, input)
    res.json({ status: 'ok', data: result })
  } catch (err) {
    next(err)
  }
})

mediaRoutes.delete('/:id', async (req, res, next) => {
  try {
    await deleteMedia(req.params.id, req.user?.id ?? null)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
