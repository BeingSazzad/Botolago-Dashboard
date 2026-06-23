import type { ContentStatus, ID } from '@/types/common.types'

export interface CmsPage {
  id: ID
  slug: string
  title: string
  /** Markdown / rich body. */
  body: string
  status: ContentStatus
  updatedAt: string
  updatedBy: string
}

export interface FaqItem {
  id: ID
  question: string
  answer: string
  category: string
  order: number
  status: ContentStatus
}
