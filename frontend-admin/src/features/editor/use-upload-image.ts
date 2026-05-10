import { useState } from 'react'
import axios from 'axios'
import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type { DirectUploadOutput } from '@template/shared'

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif']

export interface UploadResult {
  publicUrl: string
  key: string
}

export function useUploadImage() {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File): Promise<UploadResult | null> => {
    setError(null)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Tipo não suportado. Use ${ALLOWED_TYPES.join(', ')}.`)
      return null
    }
    if (file.size > MAX_SIZE) {
      setError(`Arquivo muito grande (máx ${(MAX_SIZE / 1024 / 1024).toFixed(0)} MB)`)
      return null
    }

    setUploading(true)
    setProgress(0)

    try {
      const { data } = await apiClient.post<ApiSuccess<DirectUploadOutput>>(
        '/uploads/file',
        file,
        {
          headers: { 'Content-Type': file.type },
          params: { filename: file.name },
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
          },
        },
      )
      return { publicUrl: data.data.publicUrl, key: data.data.key }
    } catch (err) {
      let msg = 'Erro no upload'
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data
        const detail =
          typeof data === 'string'
            ? data
            : data?.message ?? data?.error?.message ?? err.message
        if (status === 413) {
          msg = `Arquivo muito grande para o servidor (máx ${(MAX_SIZE / 1024 / 1024).toFixed(0)} MB).`
        } else if (status) {
          msg = `Falha no upload (HTTP ${status})${detail ? `: ${detail}` : ''}`
        } else if (err.code === 'ERR_NETWORK') {
          msg = 'Falha no upload: API de imagens inacessível. Verifique se o backend está rodando.'
        } else {
          msg = `Falha no upload: ${detail ?? err.message}`
        }
      } else if (err instanceof Error) {
        msg = `Falha no upload: ${err.message}`
      }
      console.error('[upload]', err)
      setError(msg)
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, progress, error }
}
