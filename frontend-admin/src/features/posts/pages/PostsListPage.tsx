import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Edit3, Trash2, Sparkles, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { usePosts, useDeletePost } from '../api/use-posts'
import { PostStatusBadge } from '../components/PostStatusBadge'
import { PostFilters } from '../components/PostFilters'
import { Button } from '@/components/ui/button'
import type { PostListQuery } from '@aumaf/shared'

export function PostsListPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState<Partial<PostListQuery>>({ page: 1, pageSize: 20 })
  const { data, isLoading, isFetching, isError, error } = usePosts(query)
  const deletePost = useDeletePost()

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Excluir o post "${title}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deletePost.mutateAsync(id)
      toast.success('Post excluído')
    } catch (err) {
      toast.error('Erro ao excluir', { description: (err as Error).message })
    }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-[1400px]">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">
              / 02
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">
              Conteúdo
            </span>
          </div>
          <h1 className="text-[clamp(28px,3vw,40px)] font-bold text-white uppercase leading-none tracking-[-0.03em]">
            Posts <span className="text-gradient-green">do blog.</span>
          </h1>
          <p className="text-[13px] text-on-surface-variant max-w-md leading-relaxed">
            Rascunhos, publicados e gerados por IA — gestão completa.
          </p>
        </div>
        <Button asChild size="md">
          <Link to="/posts/new">
            <Plus className="size-3.5" />
            Novo post
          </Link>
        </Button>
      </header>

      <div className="bg-surface-low/60 border border-white/10 rounded-sm p-4">
        <PostFilters value={query} onChange={setQuery} />
      </div>

      <div className="bg-surface-low/60 border border-white/10 rounded-sm overflow-hidden">
        {isError && (
          <div className="p-6 text-sm text-error">Erro: {(error as Error).message}</div>
        )}

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-surface-dim/50">
                <tr className="text-on-surface-variant/70 text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="text-left px-6 py-3">Título</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Status</th>
                  <th className="text-left px-6 py-3 hidden lg:table-cell">Categoria</th>
                  <th className="text-left px-6 py-3 hidden xl:table-cell">
                    Atualizado
                  </th>
                  <th className="text-right px-6 py-3 w-32">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-white/8 last:border-b-0 hover:bg-white/3 cursor-pointer transition-colors"
                    onClick={() => navigate(`/posts/${post.id}`)}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface font-medium">{post.title}</span>
                        {post.generatedByAi && (
                          <Sparkles
                            className="size-3 text-primary-container"
                            aria-label="Gerado por IA"
                          />
                        )}
                      </div>
                      <div className="text-[10px] text-on-surface-variant/60 font-mono mt-0.5 uppercase tracking-[0.15em]">
                        /{post.slug}
                      </div>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <PostStatusBadge status={post.status} />
                    </td>
                    <td className="px-6 py-3 hidden lg:table-cell text-on-surface-variant text-[12px]">
                      {post.category?.name ?? '—'}
                    </td>
                    <td className="px-6 py-3 hidden xl:table-cell text-on-surface-variant/70 text-[11px] font-mono">
                      {format(new Date(post.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </td>
                    <td
                      className="px-6 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex gap-1">
                        <Button
                          asChild
                          size="icon"
                          variant="ghost"
                          aria-label="Editar"
                        >
                          <Link to={`/posts/${post.id}`}>
                            <Edit3 className="size-3.5" />
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(post.id, post.title)}
                          aria-label="Excluir"
                        >
                          <Trash2 className="size-3.5 text-error" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="border-t border-white/10 px-6 py-3 flex items-center justify-between bg-surface-dim/30">
            <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70 font-mono">
              {data.pagination.total} {data.pagination.total === 1 ? 'post' : 'posts'} · página{' '}
              {data.pagination.page} de {data.pagination.totalPages}
              {isFetching && ' · atualizando'}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={data.pagination.page <= 1}
                onClick={() => setQuery({ ...query, page: data.pagination.page - 1 })}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={data.pagination.page >= data.pagination.totalPages}
                onClick={() => setQuery({ ...query, page: data.pagination.page + 1 })}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div className="flex flex-col items-center text-center py-16 gap-4 px-6">
      <div className="size-12 border border-white/15 text-on-surface-variant flex items-center justify-center">
        <FileText className="size-5" />
      </div>
      <div className="text-[12px] uppercase tracking-[0.2em] font-bold text-on-surface">
        Nenhum post ainda
      </div>
      <div className="text-[12px] text-on-surface-variant/80 max-w-xs leading-relaxed">
        Crie seu primeiro post manualmente ou use o assistente de IA para gerar um rascunho.
      </div>
      <Button asChild size="sm" className="mt-2">
        <Link to="/posts/new">
          <Plus className="size-3.5" />
          Novo post
        </Link>
      </Button>
    </div>
  )
}
