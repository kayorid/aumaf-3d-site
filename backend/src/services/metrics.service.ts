import { prisma } from '../lib/prisma'
import { countLeadsLast30Days, listRecentLeadsMasked } from './lead.service'
import type { DashboardMetrics, RecentPost } from '@template/shared'

export async function getDashboard(): Promise<DashboardMetrics> {
  const [postsPublished, postsDraft, postsByAi, leadsLast30d, recentPostsRaw, recentLeads] =
    await Promise.all([
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.post.count({ where: { generatedByAi: true } }),
      countLeadsLast30Days(),
      prisma.post.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true,
        },
      }),
      listRecentLeadsMasked(5),
    ])

  const recentPosts: RecentPost[] = recentPostsRaw.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    updatedAt: p.updatedAt.toISOString(),
  }))

  return {
    postsPublished,
    postsDraft,
    leadsLast30d,
    postsByAi,
    recentPosts,
    recentLeads,
  }
}
