import { Router, type Request, type Response, type NextFunction } from 'express'
import crypto from 'node:crypto'
import { PublicPostListQuerySchema } from '@template/shared'
import * as publicService from '../services/public.service'

export const publicRoutes = Router()

function setCacheHeaders(res: Response, payload: unknown, sMaxAge: number, swr: number) {
  const body = JSON.stringify(payload)
  const etag = `W/"${crypto.createHash('sha1').update(body).digest('base64')}"`
  res.setHeader('ETag', etag)
  res.setHeader('Cache-Control', `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`)
  return { body, etag }
}

publicRoutes.get('/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = PublicPostListQuerySchema.parse(req.query)
    const result = await publicService.listPublicPosts(query)
    const { etag, body } = setCacheHeaders(res, result, 60, 300)
    if (req.headers['if-none-match'] === etag) return res.status(304).end()
    res.type('application/json').send(body)
  } catch (err) {
    next(err)
  }
})

publicRoutes.get('/posts/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await publicService.getPublicPostBySlug(req.params.slug)
    const { etag, body } = setCacheHeaders(res, post, 60, 600)
    if (req.headers['if-none-match'] === etag) return res.status(304).end()
    res.type('application/json').send(body)
  } catch (err) {
    next(err)
  }
})

publicRoutes.get('/slugs', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const slugs = await publicService.listPublicSlugs()
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    res.json({ status: 'ok', data: slugs })
  } catch (err) {
    next(err)
  }
})

publicRoutes.get('/settings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await publicService.getPublicSettings()
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600')
    res.json({ status: 'ok', data: settings })
  } catch (err) {
    next(err)
  }
})
