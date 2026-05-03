import { Link } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PostStatusBadge } from '@/features/posts/components/PostStatusBadge'
import type { RecentPost } from '@aumaf/shared'

interface Props {
  posts: RecentPost[]
  loading?: boolean
}

export function RecentPostsList({ posts, loading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos posts</CardTitle>
        <Button asChild size="sm" variant="ghost">
          <Link to="/posts">
            Ver todos <ArrowRight className="size-3" />
          </Link>
        </Button>
      </CardHeader>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-surface-200 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyPosts />
      ) : (
        <ul className="divide-y divide-border">
          {posts.map((post) => (
            <li key={post.id} className="py-3 first:pt-0 last:pb-0">
              <Link
                to={`/posts/${post.id}`}
                className="flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-text-primary truncate group-hover:text-primary-400 transition-colors">
                    {post.title}
                  </div>
                  <div
                    className="text-xs text-text-tertiary mt-0.5"
                    title={format(new Date(post.updatedAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  >
                    Editado{' '}
                    {formatDistanceToNow(new Date(post.updatedAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>
                <PostStatusBadge status={post.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function EmptyPosts() {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-3">
      <div className="size-10 rounded-md bg-surface-200 text-text-tertiary flex items-center justify-center">
        <FileText className="size-5" />
      </div>
      <div className="text-sm text-text-secondary">Nenhum post ainda</div>
      <Button asChild size="sm" variant="primary">
        <Link to="/posts/new">Criar primeiro post</Link>
      </Button>
    </div>
  )
}
