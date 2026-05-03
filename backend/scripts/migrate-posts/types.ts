export interface LegacyPostCoverImage {
  /** Caminho local relativo à raiz do monorepo */
  localPath: string
  /** Nome do arquivo no MinIO (usado como key dentro de migrated/) */
  filename: string
}

export interface LegacyPost {
  slug: string
  title: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  category: string
  publishedAt: Date
  readingTimeMin: number
  featured: boolean
  tags: string[]
  coverImage: LegacyPostCoverImage | null
  /** Markdown + HTML inline com classes do design system */
  content: string
}
