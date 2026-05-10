import { Badge } from '@/components/ui/badge'
import type { PostStatus } from '@aumaf/shared'

const STATUS_CONFIG: Record<
  PostStatus,
  { label: string; variant: 'success' | 'warn' | 'info' | 'neutral' }
> = {
  PUBLISHED: { label: 'Publicado', variant: 'success' },
  DRAFT: { label: 'Rascunho', variant: 'warn' },
  PENDING_REVIEW: { label: 'Em revisão', variant: 'info' },
  UNPUBLISHED: { label: 'Despublicado', variant: 'neutral' },
}

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const cfg = STATUS_CONFIG[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
