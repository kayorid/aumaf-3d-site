import { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadImage } from './use-upload-image'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
}

export function MediaPickerDialog({ open, onOpenChange, onSelect }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload, uploading, progress, error } = useUploadImage()
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (file: File) => {
    setPendingFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleConfirm = async () => {
    if (!pendingFile) return
    const result = await upload(pendingFile)
    if (result) {
      onSelect(result.publicUrl)
      reset()
      onOpenChange(false)
    }
  }

  const reset = () => {
    setPreview(null)
    setPendingFile(null)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface-100 border border-border rounded-lg shadow-xl z-50 p-6 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-text-primary">
                Inserir imagem
              </Dialog.Title>
              <Dialog.Description className="text-xs text-text-tertiary mt-1">
                PNG, JPG, WEBP ou AVIF · até 10 MB
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="text-text-tertiary hover:text-text-primary"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          {!preview ? (
            <label
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const file = e.dataTransfer.files[0]
                if (file) handleFile(file)
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 cursor-pointer transition-colors',
                dragOver
                  ? 'border-primary-500 bg-primary-500/5'
                  : 'border-border hover:border-border-strong bg-surface-50',
              )}
            >
              <Upload className="size-8 text-text-tertiary" />
              <div className="text-sm text-text-secondary text-center">
                Arraste uma imagem ou clique para selecionar
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-border overflow-hidden bg-surface-50">
                {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                <img
                  src={preview}
                  alt="Pré-visualização da imagem"
                  className="w-full max-h-72 object-contain"
                />
              </div>
              <div className="text-xs text-text-tertiary">
                {pendingFile?.name} ·{' '}
                {pendingFile ? `${(pendingFile.size / 1024).toFixed(0)} KB` : ''}
              </div>
              {uploading && (
                <div className="text-xs text-text-secondary flex items-center gap-2">
                  <Loader2 className="size-3 animate-spin" /> Enviando... {progress}%
                </div>
              )}
              {error && <div className="text-xs text-danger-400">{error}</div>}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            {preview && (
              <Button variant="ghost" size="sm" onClick={reset} disabled={uploading}>
                Trocar
              </Button>
            )}
            <Dialog.Close asChild>
              <Button variant="secondary" size="sm" disabled={uploading}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button onClick={handleConfirm} disabled={!pendingFile || uploading} size="sm" loading={uploading}>
              Inserir
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
