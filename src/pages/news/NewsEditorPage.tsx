import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, Newspaper, Upload } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { LoadingState } from '@/components/ui/Spinner'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import type { ContentStatus, SelectOption } from '@/types/common.types'
import type { NewsFormValues } from '@/components/news/types'
import { useGetNewsPostQuery, useSaveNewsPostMutation } from '@/services/endpoints/newsApi'

const STATUS_OPTIONS: SelectOption<string>[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

const CATEGORY_OPTIONS: SelectOption<string>[] = [
  'Match Report',
  'League News',
  'Transfers',
  'Continental',
  'Injury News',
  'Interview',
].map((c) => ({ label: c, value: c }))

const toSlug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

/** Minimal markdown -> JSX for the live preview (no extra deps). */
function renderMarkdown(body: string): ReactNode {
  const lines = body.split('\n')
  const out: ReactNode[] = []
  let list: string[] = []
  const flush = () => {
    if (list.length) {
      out.push(
        <ul key={`ul-${out.length}`} className="my-2 list-disc pl-5 text-sm text-slate-600">
          {list.map((li, i) => (
            <li key={i}>{li}</li>
          ))}
        </ul>,
      )
      list = []
    }
  }
  lines.forEach((raw, i) => {
    const line = raw.trim()
    if (line.startsWith('- ')) {
      list.push(line.slice(2))
      return
    }
    flush()
    if (!line) return
    if (line.startsWith('### ')) out.push(<h3 key={i} className="mt-3 text-base font-semibold text-slate-900">{line.slice(4)}</h3>)
    else if (line.startsWith('## ')) out.push(<h2 key={i} className="mt-4 text-lg font-semibold text-slate-900">{line.slice(3)}</h2>)
    else if (line.startsWith('# ')) out.push(<h1 key={i} className="mt-2 text-xl font-bold text-slate-900">{line.slice(2)}</h1>)
    else out.push(<p key={i} className="mt-2 text-sm leading-relaxed text-slate-600">{line}</p>)
  })
  flush()
  return out
}

export function NewsEditorPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: existing, isLoading } = useGetNewsPostQuery(id ?? '', { skip: !isEdit })
  const [savePost, { isLoading: isSaving }] = useSaveNewsPostMutation()

  const [form, setForm] = useState<NewsFormValues>({
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    coverImage: '',
    category: 'League News',
    status: 'draft',
    author: user?.name ?? 'Admin',
    publishedAt: new Date().toISOString(),
  })

  useEffect(() => {
    if (existing) {
      const { id: _id, updatedAt: _u, ...rest } = existing
      void _id
      void _u
      setForm(rest)
    }
  }, [existing])

  function set<K extends keyof NewsFormValues>(key: K, value: NewsFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'error', title: 'Invalid file', description: 'Please choose an image.' })
      return
    }
    if (file.size > 512 * 1024) {
      toast({ variant: 'error', title: 'Image too large', description: 'Keep the cover under 512 KB.' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => set('coverImage', String(reader.result))
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast({ variant: 'error', title: 'Title required', description: 'Give the post a title.' })
      return
    }
    const values: NewsFormValues = {
      ...form,
      slug: form.slug.trim() || toSlug(form.title),
      publishedAt: form.publishedAt || new Date().toISOString(),
    }
    try {
      await savePost({ id, values }).unwrap()
      toast({ variant: 'success', title: isEdit ? 'Post updated' : 'Post created', description: form.title })
      navigate(ROUTES.news)
    } catch {
      toast({ variant: 'error', title: 'Save failed', description: 'Please try again.' })
    }
  }

  if (isEdit && isLoading) return <LoadingState label="Loading post…" />

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit post' : 'New post'}
        description="Compose a news article for the app's Live News feed."
        breadcrumbs={[{ label: 'News & Blog', to: ROUTES.news }, { label: isEdit ? 'Edit' : 'New' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(ROUTES.news)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={isSaving}>
              {isEdit ? 'Save changes' : 'Publish'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Article" />
            <CardContent className="space-y-4">
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Raja clinch the derby"
              />
              <Input
                label="Slug"
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="auto-generated from title"
                hint="Used in the article URL."
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Category"
                  options={CATEGORY_OPTIONS}
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                />
                <Select
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as ContentStatus)}
                />
              </div>
              <Input label="Author" value={form.author} onChange={(e) => set('author', e.target.value)} />
              <Textarea
                label="Excerpt"
                rows={2}
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="Short summary shown on the card."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Cover image" />
            <CardContent className="space-y-3">
              <Input
                label="Image URL"
                value={form.coverImage}
                onChange={(e) => set('coverImage', e.target.value)}
                placeholder="https://… or upload below"
                leftIcon={<ImagePlus className="h-4 w-4" />}
              />
              <div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>
                  Upload image
                </Button>
                <span className="ml-2 text-xs text-slate-400">PNG/JPG, under 512 KB</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Body" description="Markdown supported (#, ##, - lists)." />
            <CardContent>
              <Textarea
                rows={12}
                value={form.body}
                onChange={(e) => set('body', e.target.value)}
                placeholder="Write the article…"
                className="font-mono"
              />
            </CardContent>
          </Card>
        </div>

        {/* Live preview */}
        <Card className="lg:sticky lg:top-20 self-start overflow-hidden">
          <CardHeader title="Preview" />
          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary-600 to-brand-navy">
            {form.coverImage ? (
              <img src={form.coverImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/70">
                <Newspaper className="h-8 w-8" />
              </div>
            )}
          </div>
          <CardContent>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="primary">{form.category}</Badge>
              <Badge variant={form.status === 'published' ? 'success' : form.status === 'draft' ? 'warning' : 'neutral'}>
                {form.status}
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{form.title || 'Untitled post'}</h2>
            {form.excerpt && <p className="mt-1 text-sm text-slate-500">{form.excerpt}</p>}
            <p className="mt-2 text-xs text-slate-400">By {form.author}</p>
            <div className="mt-3 border-t border-slate-100 pt-3">
              {form.body ? renderMarkdown(form.body) : <p className="text-sm text-slate-400">Start writing to see a preview…</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
