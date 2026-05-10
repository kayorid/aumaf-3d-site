import { Router } from 'express'
import { CreateCategorySchema, UpdateCategorySchema } from '@template/shared'
import { requireAuth, requireRole } from '../middlewares/require-auth'
import * as categoryService from '../services/category.service'

export const categoryRoutes = Router()

categoryRoutes.use(requireAuth)

categoryRoutes.get('/', async (_req, res, next) => {
  try {
    const data = await categoryService.listCategoriesWithCount()
    res.json({ status: 'ok', data })
  } catch (err) {
    next(err)
  }
})

categoryRoutes.post('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const input = CreateCategorySchema.parse(req.body)
    const data = await categoryService.createCategory(input)
    res.status(201).json({ status: 'ok', data })
  } catch (err) {
    next(err)
  }
})

categoryRoutes.patch('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const input = UpdateCategorySchema.parse(req.body)
    const data = await categoryService.updateCategory(req.params.id, input)
    res.json({ status: 'ok', data })
  } catch (err) {
    next(err)
  }
})

categoryRoutes.delete('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id)
    res.json({ status: 'ok', data: null })
  } catch (err) {
    next(err)
  }
})
