import { useEffect, useMemo, useState } from 'react'
import { Search, X, Sparkles, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SelectStyled } from '@/components/ui/select-styled'
import { useCategories } from '../api/use-posts'
import type { PostListQuery, PostStatus } from '@aumaf/shared'
import { cn } from '@/lib/utils'

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

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'updatedAt:desc', label: 'Atualizados — recentes' },
  { value: 'updatedAt:asc', label: 'Atualizados — antigos' },
  { value: 'createdAt:desc', label: 'Criados — recentes' },
  { value: 'publishedAt:desc', label: 'Publicados — recentes' },
  { value: 'title:asc', label: 'Título A→Z' },
  { value: 'title:desc', label: 'Título Z→A' },
]

const PAGE_SIZE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '10', label: '10 / página' },
  { value: '20', label: '20 / página' },
  { value: '50', label: '50 / página' },
  { value: '100', label: '100 / página' },
]

function dateToInput(d: Date | string | undefined): string {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function PostFilters({ value, onChange }: Props) {
  const [search, setSearch] = useState(value.search ?? '')
  const categories = useCategories()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (value.search ?? '')) {
        onChange({ ...value, search: search || undefined, page: 1 })
      }
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const sortValue = `${value.sort ?? 'updatedAt'}:${value.order ?? 'desc'}`
  const pageSizeValue = String(value.pageSize ?? 20)

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Todas as categorias' },
      ...(categories.data?.map((c) => ({ value: c.id, label: c.name })) ?? []),
    ],
    [categories.data],
  )

  const activeCount = [
    value.status,
    value.categoryId,
    value.dateFrom,
    value.dateTo,
    value.generatedByAi,
    value.featured,
    value.search,
  ].filter(Boolean).length

  const clearAll = () => {
    setSearch('')
    onChange({ page: 1, pageSize: value.pageSize ?? 20 })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="relative md:col-span-4">
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

        <div className="md:col-span-3">
          <SelectStyled
            value={value.status ?? ''}
            onValueChange={(v) =>
              onChange({ ...value, status: (v || undefined) as PostStatus | undefined, page: 1 })
            }
            options={STATUS_OPTIONS}
            ariaLabel="Filtrar por status"
          />
        </div>

        <div className="md:col-span-3">
          <SelectStyled
            value={value.categoryId ?? ''}
            onValueChange={(v) => onChange({ ...value, categoryId: v || undefined, page: 1 })}
            options={categoryOptions}
            ariaLabel="Filtrar por categoria"
          />
        </div>

        <div className="md:col-span-2">
          <SelectStyled
            value={sortValue}
            onValueChange={(v) => {
              const [sort, order] = v.split(':') as [
                NonNullable<PostListQuery['sort']>,
                NonNullable<PostListQuery['order']>,
              ]
              onChange({ ...value, sort, order, page: 1 })
            }}
            options={SORT_OPTIONS}
            ariaLabel="Ordenação"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-3">
          <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70 block mb-1.5">
            De
          </label>
          <Input
            type="date"
            value={dateToInput(value.dateFrom)}
            onChange={(e) =>
              onChange({
                ...value,
                dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                page: 1,
              })
            }
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70 block mb-1.5">
            Até
          </label>
          <Input
            type="date"
            value={dateToInput(value.dateTo)}
            onChange={(e) => {
              if (!e.target.value) {
                onChange({ ...value, dateTo: undefined, page: 1 })
                return
              }
              // end-of-day local — "até 09/05" inclui posts editados durante todo o dia 9
              const d = new Date(e.target.value)
              d.setHours(23, 59, 59, 999)
              onChange({ ...value, dateTo: d, page: 1 })
            }}
          />
        </div>

        <div className="md:col-span-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onChange({ ...value, generatedByAi: value.generatedByAi ? undefined : true, page: 1 })
            }
            className={cn(
              'inline-flex items-center gap-1.5 h-10 px-3 rounded-sm border text-[11px] uppercase tracking-[0.15em] transition-colors',
              value.generatedByAi
                ? 'border-primary-container/60 bg-primary-container/10 text-primary-container'
                : 'border-white/15 bg-surface-dim text-on-surface-variant hover:text-on-surface',
            )}
            aria-pressed={value.generatedByAi ? true : false}
          >
            <Sparkles className="size-3.5" /> Apenas IA
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({ ...value, featured: value.featured ? undefined : true, page: 1 })
            }
            className={cn(
              'inline-flex items-center gap-1.5 h-10 px-3 rounded-sm border text-[11px] uppercase tracking-[0.15em] transition-colors',
              value.featured
                ? 'border-primary-container/60 bg-primary-container/10 text-primary-container'
                : 'border-white/15 bg-surface-dim text-on-surface-variant hover:text-on-surface',
            )}
            aria-pressed={value.featured ? true : false}
          >
            <Star className="size-3.5" /> Destaque
          </button>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 h-10 px-3 text-[11px] uppercase tracking-[0.15em] text-on-surface-variant hover:text-error"
            >
              <X className="size-3.5" /> Limpar ({activeCount})
            </button>
          )}
        </div>

        <div className="md:col-span-2">
          <SelectStyled
            value={pageSizeValue}
            onValueChange={(v) => onChange({ ...value, pageSize: Number(v), page: 1 })}
            options={PAGE_SIZE_OPTIONS}
            ariaLabel="Itens por página"
          />
        </div>
      </div>
    </div>
  )
}
