import { Router } from 'express'
import { requireAuth } from '../middlewares/require-auth'
import { listCategories } from '../services/category.service'

export const categoryRoutes = Router()

categoryRoutes.use(requireAuth)

categoryRoutes.get('/', async (_req, res, next) => {
  try {
    const categories = await listCategories()
    res.json({ status: 'ok', data: categories })
  } catch (err) {
    next(err)
  }
})
