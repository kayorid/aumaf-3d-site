import { Router } from 'express'
import { UpdateSettingsSchema } from '@template/shared'
import { requireAuth, requireRole } from '../middlewares/require-auth'
import * as settingsService from '../services/settings.service'

export const settingsRoutes = Router()

settingsRoutes.use(requireAuth)
settingsRoutes.use(requireRole('ADMIN'))

settingsRoutes.get('/', async (_req, res, next) => {
  try {
    const data = await settingsService.getSettings()
    res.json({ status: 'ok', data })
  } catch (err) {
    next(err)
  }
})

settingsRoutes.patch('/', async (req, res, next) => {
  try {
    const input = UpdateSettingsSchema.parse(req.body)
    const data = await settingsService.updateSettings(input)
    res.json({ status: 'ok', data })
  } catch (err) {
    next(err)
  }
})
