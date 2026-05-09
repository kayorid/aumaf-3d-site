import { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Upload, X, Loader2, Library, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUploadImage } from './use-upload-image'
import { useMediaList, useRegisterMedia } from '@/features/media/api/use-media'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
}

type PickerTab = 'library' | 'upload'

export function MediaPickerDialog({ open, onOpenChange, onSelect }: Props) {
  const [tab, setTab] = useState<PickerTab>('library')
  const [preview, setPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload, uploading, progress, error } = useUploadImage()
  const register = useRegisterMedia()
  const [dragOver, setDragOver] = useState(false)
  const [search, setSearch] = useState('')
  const library = useMediaList({ page: 1, pageSize: 24, search: search || undefined })

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
      // Best-effort: registra na biblioteca para reaproveitamento futuro.
      try {
        await register.mutateAsync({
          key: result.key,
          url: result.publicUrl,
          contentType: pendingFile.type as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/avif',
          size: pendingFile.size,
          originalName: pendingFile.name,
        })
      } catch {
        /* registro é opcional — se falhar a imagem ainda é inserida no post */
      }
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
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface-100 border border-border rounded-lg shadow-xl z-50 p-6 animate-fade-in max-h-[85vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-text-primary">
                Inserir imagem
              </Dialog.Title>
              <Dialog.Description className="text-xs text-text-tertiary mt-1">
                Escolha da biblioteca ou faça upload novo · PNG/JPG/WEBP/AVIF até 10 MB
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

          <div className="flex gap-1 border-b border-border mb-4">
            <button
              type="button"
              onClick={() => setTab('library')}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider transition-colors border-b-2 -mb-px',
                tab === 'library' ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary',
              )}
            >
              <Library className="size-3.5" /> Biblioteca
            </button>
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider transition-colors border-b-2 -mb-px',
                tab === 'upload' ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary',
              )}
            >
              <Upload className="size-3.5" /> Novo upload
            </button>
          </div>

          {tab === 'library' ? (
            <div className="space-y-3">
              <Input
                type="search"
                placeholder="Buscar na biblioteca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {library.isLoading ? (
                <div className="text-xs text-text-tertiary text-center py-8">Carregando...</div>
              ) : library.data && library.data.items.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto">
                  {library.data.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelect(item.url)
                        onOpenChange(false)
                      }}
                      className="group relative aspect-square overflow-hidden rounded-md border border-border hover:border-primary-500 transition-colors bg-surface-50"
                      title={item.alt ?? item.originalName}
                    >
                      <img src={item.url} alt={item.alt ?? item.originalName} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-text-tertiary">
                  <ImageOff className="size-8" />
                  <p className="text-xs">Biblioteca vazia. Use a aba "Novo upload" para começar.</p>
                </div>
              )}
            </div>
          ) : !preview ? (
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

          <div className={cn('flex justify-end gap-2 mt-6', tab === 'library' && 'hidden')}>
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
