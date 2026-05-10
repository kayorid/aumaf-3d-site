import type { Request, Response, NextFunction } from 'express'
import { LoginSchema } from '@template/shared'
import { login } from '../services/auth.service'
import { COOKIE_NAME } from '../middlewares/require-auth'
import { env } from '../config/env'

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7d

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = LoginSchema.parse(req.body)
    const { token, user } = await login(input.email, input.password)

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    res.json({ status: 'ok', data: { user } })
  } catch (err) {
    next(err)
  }
}

export function logoutHandler(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV === 'production',
    path: '/',
  })
  res.json({ status: 'ok', data: null })
}

export function meHandler(req: Request, res: Response) {
  res.json({ status: 'ok', data: { user: req.user } })
}
