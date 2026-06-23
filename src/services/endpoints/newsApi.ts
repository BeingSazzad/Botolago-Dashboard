import type { NewsFormValues, NewsPost } from '@/components/news/types'
import { api } from '@/services/api'
import { newsPosts as seed } from '@/services/mock/data'
import { mockResult, nextId, paginate } from '@/services/mock/helpers'
import type { ListResponse } from '@/types/api.types'
import type { ID, QueryParams } from '@/types/common.types'

let store: NewsPost[] = [...seed]

export const newsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNewsPosts: build.query<ListResponse<NewsPost>, QueryParams | void>({
      queryFn: (params) =>
        mockResult(paginate(store, params ?? {}, ['title', 'excerpt', 'category', 'author'])),
      providesTags: (res) =>
        res
          ? [...res.items.map((p) => ({ type: 'News' as const, id: p.id })), { type: 'News', id: 'LIST' }]
          : [{ type: 'News', id: 'LIST' }],
    }),

    getNewsPost: build.query<NewsPost, ID>({
      queryFn: (id) => {
        const post = store.find((p) => p.id === id)
        return post ? mockResult(post) : { error: { status: 404, message: 'Post not found' } }
      },
      providesTags: (_r, _e, id) => [{ type: 'News', id }],
    }),

    saveNewsPost: build.mutation<NewsPost, { id?: ID; values: NewsFormValues }>({
      queryFn: ({ id, values }) => {
        const now = new Date().toISOString()
        if (id) {
          const idx = store.findIndex((p) => p.id === id)
          if (idx === -1) return { error: { status: 404, message: 'Post not found' } }
          store[idx] = { ...store[idx], ...values, updatedAt: now }
          return mockResult(store[idx])
        }
        const post: NewsPost = { ...values, id: nextId('news'), updatedAt: now }
        store = [post, ...store]
        return mockResult(post)
      },
      invalidatesTags: (r) => [{ type: 'News', id: 'LIST' }, { type: 'News', id: r?.id }],
    }),

    deleteNewsPost: build.mutation<{ id: ID }, ID>({
      queryFn: (id) => {
        store = store.filter((p) => p.id !== id)
        return mockResult({ id })
      },
      invalidatesTags: [{ type: 'News', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetNewsPostsQuery,
  useGetNewsPostQuery,
  useSaveNewsPostMutation,
  useDeleteNewsPostMutation,
} = newsApi
