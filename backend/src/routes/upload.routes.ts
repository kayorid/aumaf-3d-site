import { Router, raw } from 'express'
import { PresignInputSchema, UploadContentTypeSchema } from '@template/shared'
import { requireAuth } from '../middlewares/require-auth'
import { httpErrors } from '../lib/http-error'
import { presignUpload, uploadFile } from '../services/upload.service'

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

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif']
const MAX_BYTES = 10 * 1024 * 1024

// Direct binary upload — sidesteps presigned PUT so MinIO does not need
// to be publicly reachable from the browser. Body is the raw file bytes;
// content-type is the file's MIME; ?filename=... carries original name.
uploadRoutes.post(
  '/file',
  raw({ type: ALLOWED_TYPES, limit: MAX_BYTES }),
  async (req, res, next) => {
    try {
      const ct = (req.header('content-type') ?? '').split(';')[0]?.trim()
      const parsedCt = UploadContentTypeSchema.safeParse(ct)
      if (!parsedCt.success) {
        throw httpErrors.badRequest(
          'UNSUPPORTED_TYPE',
          `Content-Type não suportado: ${ct || '(vazio)'} — use ${ALLOWED_TYPES.join(', ')}`,
        )
      }
      if (!Buffer.isBuffer(req.body) || req.body.byteLength === 0) {
        throw httpErrors.badRequest('EMPTY_BODY', 'Corpo da requisição vazio ou não-binário')
      }
      const filename = String(req.query.filename ?? 'upload').slice(0, 255)
      const result = await uploadFile({
        buffer: req.body,
        contentType: parsedCt.data,
        originalName: filename,
      })
      res.status(201).json({ status: 'ok', data: result })
    } catch (err) {
      next(err)
    }
  },
)
