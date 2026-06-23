import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { LoadingState } from '@/components/ui/Spinner'
import { useGetPageQuery, useSavePageMutation } from '@/services/endpoints/cmsApi'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/constants/routes'
import type { ContentStatus } from '@/types/common.types'

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

/** Convert a title into a URL-friendly kebab-case slug. */
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Lightweight inline markdown renderer — no external dependencies. */
function renderMarkdown(body: string): React.ReactNode[] {
  const lines = body.split('\n')
  const nodes: React.ReactNode[] = []
  let listBuffer: string[] = []

  function flushList(key: string) {
    if (listBuffer.length === 0) return
    nodes.push(
      <ul key={key} className="list-disc pl-5 text-sm text-slate-600 leading-relaxed space-y-1">
        {listBuffer.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>,
    )
    listBuffer = []
  }

  lines.forEach((line, i) => {
    const key = String(i)

    if (line.startsWith('### ')) {
      flushList(`list-before-${key}`)
      nodes.push(
        <h3 key={key} className="text-lg font-semibold text-slate-800 mt-3">
          {line.slice(4)}
        </h3>,
      )
    } else if (line.startsWith('## ')) {
      flushList(`list-before-${key}`)
      nodes.push(
        <h2 key={key} className="text-xl font-semibold text-slate-900 mt-4">
          {line.slice(3)}
        </h2>,
      )
    } else if (line.startsWith('# ')) {
      flushList(`list-before-${key}`)
      nodes.push(
        <h1 key={key} className="text-2xl font-bold text-slate-900">
          {line.slice(2)}
        </h1>,
      )
    } else if (line.startsWith('- ')) {
      listBuffer.push(line.slice(2))
    } else if (line.trim() === '') {
      flushList(`list-${key}`)
      nodes.push(<div key={key} className="h-3" />)
    } else {
      flushList(`list-before-${key}`)
      nodes.push(
        <p key={key} className="text-sm text-slate-600 leading-relaxed">
          {line}
        </p>,
      )
    }
  })

  flushList('list-end')
  return nodes
}

export function CmsEditorPage() {
  const { slug: routeSlug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const isNew = routeSlug === 'new'

  const { data: page, isLoading: pageLoading } = useGetPageQuery(routeSlug, { skip: isNew })
  const [savePage, { isLoading: saving }] = useSavePageMutation()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<ContentStatus>('draft')

  useEffect(() => {
    if (page) {
      setTitle(page.title)
      setSlug(page.slug)
      setBody(page.body)
      setStatus(page.status)
    }
  }, [page])

  async function handleSave() {
    const resolvedSlug = isNew ? (slug.trim() || toSlug(title)) : slug
    if (!resolvedSlug) {
      toast({ type: 'error', title: 'Slug is required' })
      return
    }
    try {
      await savePage({ slug: resolvedSlug, title, body, status }).unwrap()
      toast({ type: 'success', title: isNew ? 'Page created' : 'Page saved' })
      navigate(ROUTES.cms)
    } catch {
      toast({ type: 'error', title: 'Failed to save page' })
    }
  }

  if (!isNew && pageLoading) {
    return <LoadingState label="Loading page…" />
  }

  const pageTitle = isNew ? 'New page' : (title || page?.title || routeSlug)

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Content', to: ROUTES.cms },
          { label: pageTitle },
        ]}
        title={isNew ? 'New page' : `Edit: ${pageTitle}`}
        description={isNew ? 'Create a new content page.' : 'Edit page content and settings.'}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editor column */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Page settings" description="Configure the page metadata and visibility." />
            <CardContent className="flex flex-col gap-4">
              <Input
                label="Title"
                name="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (isNew && !slug) {
                    // keep slug in sync while user types, only if they haven't manually set it
                  }
                }}
                placeholder="e.g. Terms of Service"
                required
              />
              <Input
                label="Slug"
                name="slug"
                value={isNew ? slug : `/${slug}`}
                onChange={(e) => {
                  if (isNew) setSlug(e.target.value.replace(/^\//, ''))
                }}
                placeholder={isNew ? 'e.g. terms-of-service (auto-derived if blank)' : undefined}
                disabled={!isNew}
                hint={isNew ? 'Leave blank to auto-derive from title.' : 'Slug cannot be changed after creation.'}
              />
              <Select
                label="Status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                options={STATUS_OPTIONS}
              />
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader
              title="Body"
              description="Write content using Markdown. Headings (#, ##, ###), lists (-) and paragraphs are supported."
            />
            <CardContent>
              <Textarea
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={18}
                placeholder={'# Page Title\n\nWrite your content here using Markdown.\n\n## Section\n\n- Item one\n- Item two\n\nYour paragraph text goes here.'}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview column */}
        <div className="flex flex-col gap-6">
          <Card className="sticky top-6">
            <CardHeader title="Preview" description="Live rendering of the page body." />
            <CardContent>
              {body.trim() ? (
                <div className="min-h-[24rem] space-y-2">{renderMarkdown(body)}</div>
              ) : (
                <div className="flex min-h-[24rem] items-center justify-center rounded-lg border-2 border-dashed border-slate-200">
                  <p className="text-sm text-slate-400">Start typing in the editor to see a preview.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer actions */}
      <Card className="mt-6">
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={() => navigate(ROUTES.cms)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {isNew ? 'Create page' : 'Save changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
