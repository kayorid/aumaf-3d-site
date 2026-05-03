import type { Request, Response, NextFunction } from 'express'
import { CreatePostSchema, UpdatePostSchema, PostListQuerySchema } from '@aumaf/shared'
import * as postService from '../services/post.service'
import { httpErrors } from '../lib/http-error'

export async function listHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = PostListQuerySchema.parse(req.query)
    const result = await postService.listPosts(query)
    res.json({ status: 'ok', ...result })
  } catch (err) {
    next(err)
  }
}

export async function getHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postService.getPostById(req.params.id)
    res.json({ status: 'ok', data: post })
  } catch (err) {
    next(err)
  }
}

export async function createHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = CreatePostSchema.parse(req.body)
    if (!req.user) throw httpErrors.unauthorized()
    const post = await postService.createPost(input, req.user.id)
    res.status(201).json({ status: 'ok', data: post })
  } catch (err) {
    next(err)
  }
}

export async function updateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = UpdatePostSchema.parse(req.body)
    const post = await postService.updatePost(req.params.id, input)
    res.json({ status: 'ok', data: post })
  } catch (err) {
    next(err)
  }
}

export async function deleteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await postService.deletePost(req.params.id)
    res.json({ status: 'ok', data: null })
  } catch (err) {
    next(err)
  }
}

export async function publishHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postService.publishPost(req.params.id)
    res.json({ status: 'ok', data: post })
  } catch (err) {
    next(err)
  }
}

export async function unpublishHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postService.unpublishPost(req.params.id)
    res.json({ status: 'ok', data: post })
  } catch (err) {
    next(err)
  }
}
