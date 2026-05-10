import { Router } from 'express'
import {
  CreateUserSchema,
  UpdateUserSchema,
  SetUserPermissionsSchema,
} from '@template/shared'
import { requireAuth, requirePermission } from '../middlewares/require-auth'
import { httpErrors } from '../lib/http-error'
import { permissionCatalog } from '../lib/permissions'
import * as userService from '../services/user.service'

export const userRoutes = Router()

userRoutes.get('/', requireAuth, requirePermission('users', 'view'), async (_req, res, next) => {
  try {
    const users = await userService.listUsers()
    res.json({ status: 'ok', data: users })
  } catch (err) {
    next(err)
  }
})

userRoutes.post('/', requireAuth, requirePermission('users', 'edit'), async (req, res, next) => {
  try {
    const input = CreateUserSchema.parse(req.body)
    const result = await userService.createUser(input)
    res.status(201).json({ status: 'ok', data: result })
  } catch (err) {
    next(err)
  }
})

userRoutes.get('/:id', requireAuth, requirePermission('users', 'view'), async (req, res, next) => {
  try {
    const user = await userService.getUserDetail(req.params.id)
    res.json({ status: 'ok', data: user })
  } catch (err) {
    next(err)
  }
})

userRoutes.patch('/:id', requireAuth, requirePermission('users', 'edit'), async (req, res, next) => {
  try {
    if (!req.user) throw httpErrors.unauthorized()
    const input = UpdateUserSchema.parse(req.body)
    const user = await userService.updateUser(req.params.id, input, req.user.id)
    res.json({ status: 'ok', data: user })
  } catch (err) {
    next(err)
  }
})

userRoutes.delete('/:id', requireAuth, requirePermission('users', 'edit'), async (req, res, next) => {
  try {
    if (!req.user) throw httpErrors.unauthorized()
    await userService.deleteUser(req.params.id, req.user.id)
    res.json({ status: 'ok' })
  } catch (err) {
    next(err)
  }
})

userRoutes.post(
  '/:id/reset-password',
  requireAuth,
  requirePermission('users', 'edit'),
  async (req, res, next) => {
    try {
      const result = await userService.resetUserPassword(req.params.id)
      res.json({ status: 'ok', data: result })
    } catch (err) {
      next(err)
    }
  },
)

userRoutes.put(
  '/:id/permissions',
  requireAuth,
  requirePermission('users', 'edit'),
  async (req, res, next) => {
    try {
      if (!req.user) throw httpErrors.unauthorized()
      const input = SetUserPermissionsSchema.parse(req.body)
      const user = await userService.setUserPermissions(req.params.id, input.permissions, req.user.id)
      res.json({ status: 'ok', data: user })
    } catch (err) {
      next(err)
    }
  },
)

// Catálogo de features/ações + presets — qualquer usuário autenticado pode ler
// (a UI usa para renderizar a matriz e o sidebar gating).
export const permissionsRoutes = Router()
permissionsRoutes.get('/catalog', requireAuth, async (_req, res, next) => {
  try {
    res.json({ status: 'ok', data: permissionCatalog() })
  } catch (err) {
    next(err)
  }
})
permissionsRoutes.get('/me', requireAuth, async (req, res, next) => {
  try {
    if (!req.user) throw httpErrors.unauthorized()
    const list = req.user.permissions ? [...req.user.permissions] : []
    res.json({ status: 'ok', data: list })
  } catch (err) {
    next(err)
  }
})
