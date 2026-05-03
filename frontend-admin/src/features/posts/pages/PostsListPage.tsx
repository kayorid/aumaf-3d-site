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
import { Card } from '@/components/ui/card'
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
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Posts</h1>
          <p className="text-sm text-text-secondary mt-1">
            Gestão de conteúdo do blog — rascunhos, publicados e gerados por IA.
          </p>
        </div>
        <Button asChild>
          <Link to="/posts/new">
            <Plus className="size-4" />
            Novo post
          </Link>
        </Button>
      </header>

      <Card>
        <PostFilters value={query} onChange={setQuery} />
      </Card>

      <Card className="p-0 overflow-hidden">
        {isError && (
          <div className="p-6 text-sm text-danger-400">Erro: {(error as Error).message}</div>
        )}

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded bg-surface-200 animate-pulse" />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-50">
                <tr className="text-text-tertiary text-xs uppercase tracking-wider font-mono">
                  <th className="text-left px-6 py-3 font-medium">Título</th>
                  <th className="text-left px-6 py-3 font-medium hidden md:table-cell">Status</th>
                  <th className="text-left px-6 py-3 font-medium hidden lg:table-cell">Categoria</th>
                  <th className="text-left px-6 py-3 font-medium hidden xl:table-cell">
                    Atualizado
                  </th>
                  <th className="text-right px-6 py-3 font-medium w-32">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/posts/${post.id}`)}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary font-medium">{post.title}</span>
                        {post.generatedByAi && (
                          <Sparkles
                            className="size-3.5 text-primary-400"
                            aria-label="Gerado por IA"
                          />
                        )}
                      </div>
                      <div className="text-[11px] text-text-tertiary font-mono mt-0.5">
                        /{post.slug}
                      </div>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <PostStatusBadge status={post.status} />
                    </td>
                    <td className="px-6 py-3 hidden lg:table-cell text-text-secondary">
                      {post.category?.name ?? '—'}
                    </td>
                    <td className="px-6 py-3 hidden xl:table-cell text-text-tertiary text-xs font-mono">
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
                            <Edit3 className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(post.id, post.title)}
                          aria-label="Excluir"
                        >
                          <Trash2 className="size-4 text-danger-400" />
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
          <div className="border-t border-border px-6 py-3 flex items-center justify-between">
            <div className="text-xs text-text-tertiary">
              {data.pagination.total} {data.pagination.total === 1 ? 'post' : 'posts'} ·{' '}
              página {data.pagination.page} de {data.pagination.totalPages}
              {isFetching && ' · atualizando...'}
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
      </Card>
    </div>
  )
}

function Empty() {
  return (
    <div className="flex flex-col items-center text-center py-16 gap-3 px-6">
      <div className="size-12 rounded-md bg-surface-200 text-text-tertiary flex items-center justify-center">
        <FileText className="size-6" />
      </div>
      <div className="text-sm font-medium text-text-primary">Nenhum post ainda</div>
      <div className="text-xs text-text-tertiary max-w-xs">
        Crie seu primeiro post manualmente ou use o assistente de IA para gerar um rascunho.
      </div>
      <Button asChild size="sm" className="mt-2">
        <Link to="/posts/new">
          <Plus className="size-4" />
          Novo post
        </Link>
      </Button>
    </div>
  )
}
