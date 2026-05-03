import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { PostListQuery, PostStatus } from '@aumaf/shared'

interface Props {
  value: Partial<PostListQuery>
  onChange: (next: Partial<PostListQuery>) => void
}

const STATUS_OPTIONS: Array<{ value: '' | PostStatus; label: string }> = [
  { value: '', label: 'Todos os status' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'PUBLISHED', label: 'Publicado' },
  { value: 'PENDING_REVIEW', label: 'Em revisão' },
  { value: 'UNPUBLISHED', label: 'Despublicado' },
]

export function PostFilters({ value, onChange }: Props) {
  const [search, setSearch] = useState(value.search ?? '')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (value.search ?? '')) {
        onChange({ ...value, search: search || undefined, page: 1 })
      }
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <div className="flex gap-3 items-center flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título ou resumo..."
          className="pl-9 pr-9"
          aria-label="Buscar posts"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            aria-label="Limpar busca"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="w-44">
        <Select
          value={value.status ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              status: (e.target.value || undefined) as PostStatus | undefined,
              page: 1,
            })
          }
          aria-label="Filtrar por status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
