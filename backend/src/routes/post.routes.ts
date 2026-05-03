import { Router } from 'express'
import { requireAuth, requireRole } from '../middlewares/require-auth'
import * as postController from '../controllers/post.controller'

export const postRoutes = Router()

postRoutes.use(requireAuth)

postRoutes.get('/', postController.listHandler)
postRoutes.get('/:id', postController.getHandler)
postRoutes.post('/', postController.createHandler)
postRoutes.patch('/:id', postController.updateHandler)
postRoutes.patch('/:id/auto-save', postController.autoSaveHandler)
postRoutes.delete('/:id', requireRole('ADMIN'), postController.deleteHandler)
postRoutes.post('/:id/publish', postController.publishHandler)
postRoutes.post('/:id/unpublish', postController.unpublishHandler)
