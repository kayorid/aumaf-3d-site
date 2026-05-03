import { useState } from 'react'
import axios from 'axios'
import { apiClient } from '@/lib/api'
import type { ApiSuccess } from '@/lib/api'
import type { PresignInput, PresignOutput } from '@aumaf/shared'

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
      const presignBody: PresignInput = {
        filename: file.name,
        contentType: file.type as PresignInput['contentType'],
        size: file.size,
      }
      const { data } = await apiClient.post<ApiSuccess<PresignOutput>>(
        '/uploads/presign',
        presignBody,
      )
      const presign = data.data

      await axios.put(presign.uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
        },
      })

      return { publicUrl: presign.publicUrl, key: presign.key }
    } catch (err) {
      const msg = (err as Error).message ?? 'Erro no upload'
      setError(msg)
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, progress, error }
}
