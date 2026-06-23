import type { ContentStatus, ID } from '@/types/common.types'

/** Where a post came from: the external news feed/API, or written by an admin. */
export type NewsSource = 'feed' | 'admin'

/** A news / blog article shown in the app's "Live News" feed. */
export interface NewsPost {
  id: ID
  /** 'feed' = auto-ingested from the API; 'admin' = written in this dashboard. */
  source: NewsSource
  title: string
  slug: string
  /** Short summary shown on cards. */
  excerpt: string
  /** Full article body (markdown). */
  body: string
  /** Cover image — a URL or an uploaded data URL. */
  coverImage: string
  category: string
  status: ContentStatus
  author: string
  /** Publish date (ISO). */
  publishedAt: string
  updatedAt: string
}

export type NewsFormValues = Omit<NewsPost, 'id' | 'updatedAt'>
