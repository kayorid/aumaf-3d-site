import axios, { AxiosError } from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export interface ApiErrorResponse {
  status: 'error'
  code: string
  message: string
  details?: unknown
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiErrorResponse>) => {
    if (err.response?.data) {
      const { code, message, details } = err.response.data
      return Promise.reject(new ApiError(err.response.status, code, message, details))
    }
    return Promise.reject(new ApiError(0, 'NETWORK_ERROR', err.message))
  },
)

export interface ApiSuccess<T> {
  status: 'ok'
  data: T
}

export interface ApiList<T> {
  status: 'ok'
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
