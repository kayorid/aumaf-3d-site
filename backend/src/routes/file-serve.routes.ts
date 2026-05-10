import { Router } from 'express'
import { Readable } from 'node:stream'
import { logger } from '../config/logger'
import { getFileObject } from '../services/upload.service'

export const fileServeRoutes = Router()

// Public proxy for stored objects — keeps MinIO off the public network.
// Mounted at /api/v1/files; key may contain slashes (e.g. posts/uuid-name.jpg).
// Defesa em profundidade: só servimos chaves dentro destes prefixos.
const ALLOWED_PREFIXES = ['posts/']

fileServeRoutes.get(/^\/(.+)$/, async (req, res) => {
  const key = req.params[0]
  if (!key) {
    res.status(404).json({ status: 'error', code: 'NOT_FOUND', message: 'Missing key' })
    return
  }
  if (!ALLOWED_PREFIXES.some((p) => key.startsWith(p))) {
    res.status(404).json({ status: 'error', code: 'NOT_FOUND', message: 'File not found' })
    return
  }
  try {
    const obj = await getFileObject(key)
    if (obj.ContentType) res.setHeader('Content-Type', obj.ContentType)
    if (obj.ContentLength) res.setHeader('Content-Length', String(obj.ContentLength))
    if (obj.ETag) res.setHeader('ETag', obj.ETag)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('X-Content-Type-Options', 'nosniff')

    const body = obj.Body
    if (!body) {
      res.status(404).end()
      return
    }
    if (body instanceof Readable) {
      body.pipe(res)
    } else if (typeof (body as { transformToWebStream?: () => ReadableStream }).transformToWebStream === 'function') {
      const webStream = (body as { transformToWebStream: () => ReadableStream }).transformToWebStream()
      Readable.fromWeb(webStream as unknown as import('stream/web').ReadableStream).pipe(res)
    } else {
      const buf = Buffer.from(
        await (body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray(),
      )
      res.end(buf)
    }
  } catch (err) {
    const code = (err as { Code?: string; name?: string }).Code ?? (err as { name?: string }).name
    if (code === 'NoSuchKey' || code === 'NotFound') {
      res.status(404).json({ status: 'error', code: 'NOT_FOUND', message: 'File not found' })
      return
    }
    logger.error({ err, key }, 'Failed to serve file')
    res.status(502).json({ status: 'error', code: 'STORAGE_ERROR', message: 'Failed to fetch file' })
  }
})
