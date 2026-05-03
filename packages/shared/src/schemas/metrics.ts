import { z } from 'zod'
import { PostStatusSchema } from './post'
import { LeadMaskedDtoSchema } from './lead'

export const RecentPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  status: PostStatusSchema,
  updatedAt: z.string(),
})
export type RecentPost = z.infer<typeof RecentPostSchema>

export const DashboardMetricsSchema = z.object({
  postsPublished: z.number(),
  postsDraft: z.number(),
  leadsLast30d: z.number(),
  postsByAi: z.number(),
  recentPosts: z.array(RecentPostSchema),
  recentLeads: z.array(LeadMaskedDtoSchema),
})
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>
