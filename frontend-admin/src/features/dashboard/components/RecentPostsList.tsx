import { Link } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PostStatusBadge } from '@/features/posts/components/PostStatusBadge'
import type { RecentPost } from '@aumaf/shared'

interface Props {
  posts: RecentPost[]
  loading?: boolean
}

export function RecentPostsList({ posts, loading }: Props) {
  return (
    <div className="bg-surface-low/60 border border-white/10 rounded-sm">
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-primary-container/80 tracking-[0.2em]">/ A</span>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface">
            Últimos posts
          </h3>
        </div>
        <Button asChild size="sm" variant="ghost" className="!text-[10px] !tracking-[0.15em]">
          <Link to="/posts">
            Ver todos <ArrowRight className="size-3" />
          </Link>
        </Button>
      </header>

      <div className="p-5 pt-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-white/8">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  to={`/posts/${post.id}`}
                  className="flex items-center justify-between gap-3 py-3 group hover:bg-white/5 -mx-2 px-2 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-on-surface truncate group-hover:text-primary-container transition-colors">
                      {post.title}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/70 mt-1.5 font-mono"
                      title={format(new Date(post.updatedAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    >
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
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div className="flex flex-col items-center text-center py-10 gap-3">
      <div className="size-10 border border-white/15 text-on-surface-variant flex items-center justify-center">
        <FileText className="size-4" />
      </div>
      <div className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">
        Nenhum post ainda
      </div>
      <Button asChild size="sm">
        <Link to="/posts/new">Criar primeiro post</Link>
      </Button>
    </div>
  )
}
