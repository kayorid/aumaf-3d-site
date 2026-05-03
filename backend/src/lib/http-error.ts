export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
  }

  toJSON() {
    return {
      status: 'error' as const,
      code: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    }
  }
}

export const httpErrors = {
  badRequest: (code: string, message: string, details?: unknown) =>
    new HttpError(400, code, message, details),
  unauthorized: (message = 'Unauthorized') =>
    new HttpError(401, 'UNAUTHORIZED', message),
  forbidden: (message = 'Forbidden') =>
    new HttpError(403, 'FORBIDDEN', message),
  notFound: (message = 'Not found') =>
    new HttpError(404, 'NOT_FOUND', message),
  conflict: (code: string, message: string) =>
    new HttpError(409, code, message),
  unprocessable: (code: string, message: string, details?: unknown) =>
    new HttpError(422, code, message, details),
  tooManyRequests: (message = 'Too many requests') =>
    new HttpError(429, 'TOO_MANY_REQUESTS', message),
  internal: (message = 'Internal server error') =>
    new HttpError(500, 'INTERNAL_ERROR', message),
  badGateway: (code: string, message: string) =>
    new HttpError(502, code, message),
}
