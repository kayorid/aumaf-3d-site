import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Upload, Search, Trash2, Pencil, Copy, ImageOff, Loader2 } from 'lucide-react'
import type { MediaAssetDto } from '@template/shared'
import { useMediaList, useRegisterMedia, useUpdateMedia, useDeleteMedia } from '../api/use-media'
import { useUploadImage } from '@/features/editor/use-upload-image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { LoadingScreen } from '@/components/layout/LoadingScreen'

const PAGE_SIZE = 40

export function MediaLibraryPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState<MediaAssetDto | null>(null)
  const [pendingDelete, setPendingDelete] = useState<MediaAssetDto | null>(null)

  const list = useMediaList({ page, pageSize: PAGE_SIZE, search: search || undefined })
  const register = useRegisterMedia()
  const updateMutation = useUpdateMedia()
  const removeMutation = useDeleteMedia()
  const { upload, uploading, progress, error: uploadError } = useUploadImage()

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return
    for (const file of Array.from(files)) {
      const result = await upload(file)
      if (!result) {
        toast.error(uploadError ?? 'Falha no upload.')
        continue
      }
      try {
        await register.mutateAsync({
          key: result.key,
          url: result.publicUrl,
          contentType: file.type as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/avif',
          size: file.size,
          originalName: file.name,
        })
        toast.success(`${file.name} adicionado à biblioteca.`)
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Erro ao registrar mídia.')
      }
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  function copyUrl(url: string) {
    void navigator.clipboard.writeText(url)
    toast.success('URL copiada.')
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await removeMutation.mutateAsync(pendingDelete.id)
      toast.success('Mídia removida.')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao remover.')
    }
  }

  async function saveAlt(item: MediaAssetDto, alt: string) {
    try {
      await updateMutation.mutateAsync({ id: item.id, input: { alt: alt || null } })
      toast.success('Texto alternativo salvo.')
      setEditing(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar.')
    }
  }

  if (list.isLoading) return <LoadingScreen />

  const data = list.data!
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))

  return (
    <div className="space-y-8 animate-fade-in max-w-[1300px]">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">/ 07</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Biblioteca de mídia</span>
        </div>
        <h1 className="text-[clamp(28px,3vw,40px)] font-bold text-white uppercase leading-none tracking-[-0.03em]">
          Mídia <span className="text-gradient-green">do site.</span>
        </h1>
        <p className="text-[13px] text-on-surface-variant max-w-md leading-relaxed">
          Imagens reutilizáveis pelo blog e páginas. Faça upload, defina alt e copie a URL.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/60" />
            <Input
              type="search"
              placeholder="Buscar por nome ou texto alternativo"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline" size="md">Buscar</Button>
        </form>
        <div className="flex items-center gap-3">
          {uploading && (
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary-container">
              <Loader2 className="size-3.5 animate-spin" />
              {progress}%
            </span>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            multiple
            hidden
            onChange={(e) => {
              void handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <Button onClick={() => inputRef.current?.click()} disabled={uploading} size="md">
            <Upload className="size-3.5" />
            Enviar imagens
          </Button>
        </div>
      </div>

      {data.items.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-sm bg-surface-low/40 p-12 text-center space-y-3">
          <ImageOff className="size-8 mx-auto text-on-surface-variant/40" />
          <p className="text-[13px] text-on-surface-variant">
            {search ? 'Nenhuma mídia encontrada para esta busca.' : 'Sua biblioteca está vazia. Faça o primeiro upload acima.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {data.items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onCopy={() => copyUrl(item.url)}
              onEdit={() => setEditing(item)}
              onDelete={() => setPendingDelete(item)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <p className="text-[11px] text-on-surface-variant">
            Página {page} de {totalPages} · {data.total} mídias
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Próxima
            </Button>
          </div>
        </div>
      )}

      {editing && (
        <EditAltDialog
          item={editing}
          saving={updateMutation.isPending}
          onClose={() => setEditing(null)}
          onSave={(alt) => saveAlt(editing, alt)}
        />
      )}

      {pendingDelete && (
        <ConfirmDeleteDialog
          item={pendingDelete}
          loading={removeMutation.isPending}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

function MediaCard({
  item,
  onCopy,
  onEdit,
  onDelete,
}: {
  item: MediaAssetDto
  onCopy: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="group relative bg-surface-low/60 border border-white/10 rounded-sm overflow-hidden hover:border-primary-container/40 transition-colors">
      <div className="aspect-square bg-black/40 overflow-hidden">
        <img
          src={item.url}
          alt={item.alt ?? item.originalName}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-2.5 space-y-1">
        <p className="text-[11px] truncate text-on-surface" title={item.originalName}>
          {item.originalName}
        </p>
        <p className="text-[10px] text-on-surface-variant/70 truncate" title={item.alt ?? ''}>
          {item.alt ? `alt: ${item.alt}` : 'sem alt'}
        </p>
        <p className="text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/50">
          {(item.size / 1024).toFixed(0)} KB
        </p>
      </div>
      <div className="absolute inset-x-0 top-0 flex justify-end gap-1 p-1.5 bg-gradient-to-b from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onCopy}
          className="p-1.5 rounded-sm bg-black/50 hover:bg-primary-container/20 text-on-surface hover:text-primary-container"
          title="Copiar URL"
          type="button"
        >
          <Copy className="size-3.5" />
        </button>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-sm bg-black/50 hover:bg-primary-container/20 text-on-surface hover:text-primary-container"
          title="Editar texto alternativo"
          type="button"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-sm bg-black/50 hover:bg-error/20 text-on-surface hover:text-error"
          title="Remover"
          type="button"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

function EditAltDialog({
  item,
  saving,
  onClose,
  onSave,
}: {
  item: MediaAssetDto
  saving: boolean
  onClose: () => void
  onSave: (alt: string) => void
}) {
  const [alt, setAlt] = useState(item.alt ?? '')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md rounded-sm border border-white/10 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[13px] uppercase tracking-[0.2em] text-on-surface">Texto alternativo</h3>
        <img src={item.url} alt={item.originalName} className="w-full max-h-48 object-contain rounded-sm bg-black/40" />
        <div className="space-y-2">
          <Label htmlFor="alt-text" className="block">Descreva a imagem para acessibilidade e SEO</Label>
          <Input id="alt-text" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} placeholder="Ex: Peça impressa em PLA verde sobre bancada" />
          <p className="text-[10px] text-on-surface-variant/60">{alt.length}/300</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={() => onSave(alt.trim())} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ConfirmDeleteDialog({
  item,
  loading,
  onCancel,
  onConfirm,
}: {
  item: MediaAssetDto
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onCancel}>
      <div
        className={cn('glass-panel w-full max-w-sm rounded-sm border border-error/40 p-6 space-y-4')}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[13px] uppercase tracking-[0.2em] text-error">Remover mídia</h3>
        <p className="text-[12px] text-on-surface">
          Tem certeza que quer remover <span className="font-semibold">{item.originalName}</span>?
          A imagem também será apagada do storage. Esta ação é irreversível.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={loading} className="bg-error/80 hover:bg-error border-error/40 text-white">
            {loading ? 'Removendo…' : 'Remover'}
          </Button>
        </div>
      </div>
    </div>
  )
}
