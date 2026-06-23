import type { CmsPage, FaqItem } from '@/components/cms/types'
import { api } from '@/services/api'
import { cmsPages as pageSeed, faqs as faqSeed } from '@/services/mock/data'
import { mockResult, nextId } from '@/services/mock/helpers'
import type { ID } from '@/types/common.types'

let pages: CmsPage[] = [...pageSeed]
let faqItems: FaqItem[] = [...faqSeed]

export const cmsApi = api.injectEndpoints({
  endpoints: (build) => ({
    /* ---- Pages ---- */
    getPages: build.query<CmsPage[], void>({
      queryFn: () => mockResult([...pages]),
      providesTags: [{ type: 'CmsPage', id: 'LIST' }],
    }),

    getPage: build.query<CmsPage, string>({
      queryFn: (slug) => {
        const page = pages.find((p) => p.slug === slug)
        return page ? mockResult(page) : { error: { status: 404, message: 'Page not found' } }
      },
      providesTags: (_r, _e, slug) => [{ type: 'CmsPage', id: slug }],
    }),

    savePage: build.mutation<CmsPage, Partial<CmsPage> & { slug: string }>({
      queryFn: (changes) => {
        const idx = pages.findIndex((p) => p.slug === changes.slug)
        const now = new Date().toISOString()
        if (idx === -1) {
          const page: CmsPage = {
            id: nextId('cms'),
            slug: changes.slug,
            title: changes.title ?? 'Untitled',
            body: changes.body ?? '',
            status: changes.status ?? 'draft',
            updatedAt: now,
            updatedBy: 'You',
          }
          pages = [...pages, page]
          return mockResult(page)
        }
        pages[idx] = { ...pages[idx], ...changes, updatedAt: now, updatedBy: 'You' }
        return mockResult(pages[idx])
      },
      invalidatesTags: (r) => [{ type: 'CmsPage', id: 'LIST' }, { type: 'CmsPage', id: r?.slug }],
    }),

    /* ---- FAQ ---- */
    getFaqs: build.query<FaqItem[], void>({
      queryFn: () => mockResult([...faqItems].sort((a, b) => a.order - b.order)),
      providesTags: [{ type: 'Faq', id: 'LIST' }],
    }),

    saveFaq: build.mutation<FaqItem, Partial<FaqItem> & { id?: ID }>({
      queryFn: (changes) => {
        if (!changes.id) {
          const item: FaqItem = {
            id: nextId('faq'),
            question: changes.question ?? '',
            answer: changes.answer ?? '',
            category: changes.category ?? 'General',
            order: faqItems.length + 1,
            status: changes.status ?? 'draft',
          }
          faqItems = [...faqItems, item]
          return mockResult(item)
        }
        const idx = faqItems.findIndex((f) => f.id === changes.id)
        if (idx === -1) return { error: { status: 404, message: 'FAQ not found' } }
        faqItems[idx] = { ...faqItems[idx], ...changes }
        return mockResult(faqItems[idx])
      },
      invalidatesTags: [{ type: 'Faq', id: 'LIST' }],
    }),

    deleteFaq: build.mutation<{ id: ID }, ID>({
      queryFn: (id) => {
        faqItems = faqItems.filter((f) => f.id !== id)
        return mockResult({ id })
      },
      invalidatesTags: [{ type: 'Faq', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetPagesQuery,
  useGetPageQuery,
  useSavePageMutation,
  useGetFaqsQuery,
  useSaveFaqMutation,
  useDeleteFaqMutation,
} = cmsApi
