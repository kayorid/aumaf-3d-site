import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import {
  useCategoriesWithCount,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../api/use-categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConfirm } from '@/components/ui/confirm-dialog'
import type { CategoryDtoWithCount } from '@template/shared'
import { ApiError } from '@/lib/api'

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategoriesWithCount()
  const create = useCreateCategory()
  const del = useDeleteCategory()
  const confirm = useConfirm()
  const [editing, setEditing] = useState<CategoryDtoWithCount | null>(null)
  const [creating, setCreating] = useState(false)

  const handleDelete = async (cat: CategoryDtoWithCount) => {
    if (cat.postCount > 0) {
      await confirm({
        title: 'Categoria com posts vinculados',
        description: `A categoria "${cat.name}" tem ${cat.postCount} post(s) vinculado(s). Reatribua antes de excluir.`,
        confirmLabel: 'Entendi',
        variant: 'primary',
        hideCancel: true,
      })
      return
    }
    const ok = await confirm({
      title: 'Excluir categoria',
      description: `Excluir categoria "${cat.name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await del.mutateAsync(cat.id)
      toast.success('Categoria excluída')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error(err.message)
      } else {
        toast.error('Erro ao excluir', { description: (err as Error).message })
      }
    }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-[1100px]">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">/ 03</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Taxonomia</span>
          </div>
          <h1 className="text-[clamp(28px,3vw,40px)] font-bold text-white uppercase leading-none tracking-[-0.03em]">
            Categorias <span className="text-gradient-green">do blog.</span>
          </h1>
          <p className="text-[13px] text-on-surface-variant max-w-md leading-relaxed">
            Organize os posts em grupos temáticos consistentes.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} size="md">
          <Plus className="size-3.5" />
          Nova categoria
        </Button>
      </header>

      <div className="bg-surface-low/60 border border-white/10 rounded-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : categories?.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="size-5 text-on-surface-variant/50 mx-auto mb-2" />
            <p className="text-sm text-on-surface-variant">Nenhuma categoria criada ainda.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-surface-dim/50">
              <tr className="text-on-surface-variant/70 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="text-left px-6 py-3">Nome</th>
                <th className="text-left px-6 py-3">Slug</th>
                <th className="text-left px-6 py-3">Posts</th>
                <th className="text-right px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((cat) => (
                <tr key={cat.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-6 py-3.5 font-medium">{cat.name}</td>
                  <td className="px-6 py-3.5 text-on-surface-variant/80 text-[12px] font-mono">{cat.slug}</td>
                  <td className="px-6 py-3.5 text-on-surface-variant/80">{cat.postCount}</td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => setEditing(cat)}
                        className="p-1.5 text-on-surface-variant hover:text-primary-container transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={cat.postCount > 0}
                        className="p-1.5 text-on-surface-variant hover:text-error disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Excluir"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {creating && (
        <CategoryDialog
          mode="create"
          onClose={() => setCreating(false)}
          onSubmit={async ({ name, slug }) => {
            await create.mutateAsync({ name, slug: slug || undefined })
            toast.success('Categoria criada')
            setCreating(false)
          }}
        />
      )}
      {editing && (
        <CategoryEditDialog
          category={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            toast.success('Categoria atualizada')
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function CategoryDialog({
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  initial?: { name: string; slug: string }
  onClose: () => void
  onSubmit: (data: { name: string; slug: string }) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return
    setBusy(true)
    try {
      await onSubmit({ name: name.trim(), slug: slug.trim() })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao salvar'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" role="dialog">
      <form onSubmit={submit} className="glass-panel w-full max-w-md rounded-sm p-6 space-y-4">
        <header>
          <h2 className="text-headline-md font-bold uppercase text-white">
            {mode === 'create' ? 'Nova categoria' : 'Editar categoria'}
          </h2>
        </header>
        <div className="space-y-1.5">
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={60} autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label>Slug (opcional, gerado automaticamente)</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" maxLength={60} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={busy}>Cancelar</Button>
          <Button type="submit" size="md" disabled={busy}>{busy ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </form>
    </div>
  )
}

function CategoryEditDialog({
  category,
  onClose,
  onSaved,
}: {
  category: CategoryDtoWithCount
  onClose: () => void
  onSaved: () => void
}) {
  const update = useUpdateCategory(category.id)
  return (
    <CategoryDialog
      mode="edit"
      initial={{ name: category.name, slug: category.slug }}
      onClose={onClose}
      onSubmit={async ({ name, slug }) => {
        await update.mutateAsync({ name, slug: slug || undefined })
        onSaved()
      }}
    />
  )
}
