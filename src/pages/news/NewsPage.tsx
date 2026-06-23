import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, Edit2, Newspaper, Plus, Trash2, User } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PermissionGate } from '@/components/shared/PermissionGate'
import { SearchInput } from '@/components/shared/SearchInput'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/Spinner'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/constants/routes'
import { cn, formatDate } from '@/lib/utils'
import type { ContentStatus, SelectOption } from '@/types/common.types'
import type { NewsPost } from '@/components/news/types'
import { useGetNewsPostsQuery, useDeleteNewsPostMutation } from '@/services/endpoints/newsApi'

const PAGE_SIZE = 9

const STATUS_VARIANT: Record<ContentStatus, BadgeVariant> = {
  published: 'success',
  draft: 'warning',
  archived: 'neutral',
}

const STATUS_OPTIONS: SelectOption<string>[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
]

/** Cover image with a graceful gradient fallback if the URL fails. */
function Cover({ src, title }: { src: string; title: string }) {
  const [ok, setOk] = useState(true)
  return (
    <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary-600 to-brand-navy">
      {ok && src ? (
        <img
          src={src}
          alt={title}
          onError={() => setOk(false)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white/70">
          <Newspaper className="h-8 w-8" />
        </div>
      )}
    </div>
  )
}

export function NewsPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [searchRaw, setSearchRaw] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState<NewsPost | null>(null)

  const search = useDebounce(searchRaw, 350)

  const { data, isLoading, isFetching } = useGetNewsPostsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })
  const [deletePost, { isLoading: isDeleting }] = useDeleteNewsPostMutation()

  const posts = data?.items ?? []
  const total = data?.total ?? 0

  async function handleDelete() {
    if (!toDelete) return
    try {
      await deletePost(toDelete.id).unwrap()
      toast({ variant: 'success', title: 'Post deleted', description: `"${toDelete.title}" was removed.` })
      setToDelete(null)
    } catch {
      toast({ variant: 'error', title: 'Delete failed', description: 'Please try again.' })
    }
  }

  return (
    <div>
      <PageHeader
        title="News & Blog"
        description="Write and publish news articles shown in the app's Live News feed."
        actions={
          <PermissionGate permission="cms.manage">
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate(ROUTES.newsNew)}>
              New post
            </Button>
          </PermissionGate>
        }
      />

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput value={searchRaw} onChange={(v) => { setSearchRaw(v); setPage(1) }} placeholder="Search news…" />
        <div className="w-44">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            aria-label="Filter by status"
          />
        </div>
      </div>

      {isLoading || isFetching ? (
        <LoadingState label="Loading news…" />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="h-6 w-6" />}
          title="No posts yet"
          description="Create your first news article to publish to the app."
          action={
            <PermissionGate permission="cms.manage">
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate(ROUTES.newsNew)}>
                New post
              </Button>
            </PermissionGate>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col overflow-hidden">
              <Cover src={post.coverImage} title={post.title} />
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="primary">{post.category}</Badge>
                  <Badge variant={STATUS_VARIANT[post.status]}>{post.status}</Badge>
                </div>
                <h3 className="line-clamp-2 font-semibold text-slate-900">{post.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {formatDate(post.publishedAt)}
                  </span>
                </div>

                <PermissionGate permission="cms.manage">
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                      onClick={() => navigate(ROUTES.newsEdit(post.id))}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn('text-rose-600 hover:bg-rose-50')}
                      leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => setToDelete(post)}
                    >
                      Delete
                    </Button>
                  </div>
                </PermissionGate>
              </div>
            </Card>
          ))}
        </div>
      )}

      {total > 0 && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete post"
        message={`Delete "${toDelete?.title ?? ''}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={isDeleting}
      />
    </div>
  )
}
