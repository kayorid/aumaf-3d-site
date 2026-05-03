import { Router } from 'express'
import { PresignInputSchema } from '@aumaf/shared'
import { requireAuth } from '../middlewares/require-auth'
import { presignUpload } from '../services/upload.service'

export const uploadRoutes = Router()

uploadRoutes.use(requireAuth)

uploadRoutes.post('/presign', async (req, res, next) => {
  try {
    const input = PresignInputSchema.parse(req.body)
    const result = await presignUpload(input)
    res.json({ status: 'ok', data: result })
  } catch (err) {
    next(err)
  }
})
