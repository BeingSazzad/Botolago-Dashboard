import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, HelpCircle, Edit2, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PermissionGate } from '@/components/shared/PermissionGate'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/Spinner'
import { DataTable, type Column } from '@/components/ui/Table'
import { useGetPagesQuery, useGetFaqsQuery, useSaveFaqMutation, useDeleteFaqMutation } from '@/services/endpoints/cmsApi'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { formatDate } from '@/lib/utils'
import type { BadgeVariant } from '@/components/ui/Badge'
import type { ContentStatus } from '@/types/common.types'
import type { CmsPage as CmsPageType, FaqItem } from '@/components/cms/types'

const STATUS_VARIANT: Record<ContentStatus, BadgeVariant> = {
  published: 'success',
  draft: 'warning',
  archived: 'neutral',
}

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

interface FaqFormState {
  question: string
  answer: string
  category: string
  status: ContentStatus
}

const BLANK_FAQ: FaqFormState = {
  question: '',
  answer: '',
  category: '',
  status: 'draft',
}

export function CmsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { can } = useAuth()
  const canManage = can('cms.manage')

  const [activeTab, setActiveTab] = useState('pages')
  const [faqModalOpen, setFaqModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null)
  const [faqForm, setFaqForm] = useState<FaqFormState>(BLANK_FAQ)
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null)

  const { data: pages = [], isLoading: pagesLoading } = useGetPagesQuery()
  const { data: faqs = [], isLoading: faqsLoading } = useGetFaqsQuery()

  const [saveFaq, { isLoading: savingFaq }] = useSaveFaqMutation()
  const [deleteFaq, { isLoading: deletingFaq }] = useDeleteFaqMutation()

  const tabs = [
    { value: 'pages', label: 'Pages', icon: <FileText className="h-4 w-4" />, count: pages.length },
    { value: 'faq', label: 'FAQ', icon: <HelpCircle className="h-4 w-4" />, count: faqs.length },
  ]

  function openAddFaq() {
    setEditingFaq(null)
    setFaqForm(BLANK_FAQ)
    setFaqModalOpen(true)
  }

  function openEditFaq(faq: FaqItem) {
    setEditingFaq(faq)
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      status: faq.status,
    })
    setFaqModalOpen(true)
  }

  function closeFaqModal() {
    setFaqModalOpen(false)
    setEditingFaq(null)
    setFaqForm(BLANK_FAQ)
  }

  async function handleSaveFaq() {
    try {
      await saveFaq({
        ...(editingFaq ? { id: editingFaq.id } : {}),
        ...faqForm,
      }).unwrap()
      toast({ type: 'success', title: editingFaq ? 'FAQ updated' : 'FAQ created' })
      closeFaqModal()
    } catch {
      toast({ type: 'error', title: 'Failed to save FAQ' })
    }
  }

  async function handleDeleteFaq() {
    if (!deleteTarget) return
    try {
      await deleteFaq(deleteTarget.id).unwrap()
      toast({ type: 'success', title: 'FAQ deleted' })
      setDeleteTarget(null)
    } catch {
      toast({ type: 'error', title: 'Failed to delete FAQ' })
    }
  }

  async function handleToggleFaqStatus(faq: FaqItem) {
    const nextStatus: ContentStatus = faq.status === 'published' ? 'draft' : 'published'
    try {
      await saveFaq({ id: faq.id, status: nextStatus }).unwrap()
      toast({ type: 'success', title: `FAQ ${nextStatus === 'published' ? 'published' : 'set to draft'}` })
    } catch {
      toast({ type: 'error', title: 'Failed to update FAQ status' })
    }
  }

  const pageColumns: Column<CmsPageType>[] = [
    {
      key: 'title',
      header: 'Page',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{row.title}</p>
            <p className="font-mono text-xs text-slate-400 truncate">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last updated',
      render: (row) => (
        <div>
          <p className="text-slate-700">{formatDate(row.updatedAt)}</p>
          <p className="text-xs text-slate-400">by {row.updatedBy}</p>
        </div>
      ),
    },
    {
      key: '_actions',
      header: '',
      align: 'right',
      width: '80px',
      render: (row) => (
        <PermissionGate permission="cms.manage">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Edit2 className="h-3.5 w-3.5" />}
            onClick={(e) => {
              e.stopPropagation()
              navigate(ROUTES.cmsPage(row.slug))
            }}
          >
            Edit
          </Button>
        </PermissionGate>
      ),
    },
  ]

  function renderFaqCard(faq: FaqItem) {
    return (
      <Card key={faq.id}>
        <CardContent className="flex flex-col gap-0 p-0">
          {/* Header row: question + badges */}
          <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
            <p className="font-semibold text-slate-900 leading-snug">{faq.question}</p>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="info">{faq.category}</Badge>
              <Badge variant={STATUS_VARIANT[faq.status]}>{faq.status}</Badge>
            </div>
          </div>

          {/* Answer */}
          <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{faq.answer}</p>

          {/* Divider footer: toggle + actions */}
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
            <PermissionGate permission="cms.manage">
              <Switch
                checked={faq.status === 'published'}
                onChange={() => handleToggleFaqStatus(faq)}
                label="Published"
              />
            </PermissionGate>
            <PermissionGate permission="cms.manage">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                  onClick={() => openEditFaq(faq)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="h-3.5 w-3.5 text-rose-500" />}
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => setDeleteTarget(faq)}
                >
                  Delete
                </Button>
              </div>
            </PermissionGate>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <PageHeader
        title="Content & FAQ"
        description="Manage legal pages, help content and frequently asked questions."
      />

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'pages' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">{pages.length} page{pages.length !== 1 ? 's' : ''}</p>
            <PermissionGate permission="cms.manage">
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => navigate(ROUTES.cmsPage('new'))}
              >
                New page
              </Button>
            </PermissionGate>
          </div>

          {pagesLoading ? (
            <LoadingState label="Loading pages…" />
          ) : pages.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="No pages yet"
              description="Create your first content page to get started."
              action={
                <PermissionGate permission="cms.manage">
                  <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate(ROUTES.cmsPage('new'))}>
                    New page
                  </Button>
                </PermissionGate>
              }
            />
          ) : (
            <DataTable<CmsPageType>
              columns={pageColumns}
              data={pages}
              rowKey={(row) => row.id}
              onRowClick={canManage ? (row) => navigate(ROUTES.cmsPage(row.slug)) : undefined}
              emptyTitle="No pages found"
            />
          )}
        </div>
      )}

      {activeTab === 'faq' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">{faqs.length} item{faqs.length !== 1 ? 's' : ''}</p>
            <PermissionGate permission="cms.manage">
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={openAddFaq}
              >
                Add FAQ
              </Button>
            </PermissionGate>
          </div>

          {faqsLoading ? (
            <LoadingState label="Loading FAQs…" />
          ) : faqs.length === 0 ? (
            <EmptyState
              icon={<HelpCircle className="h-6 w-6" />}
              title="No FAQs yet"
              description="Add your first frequently asked question."
              action={
                <PermissionGate permission="cms.manage">
                  <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddFaq}>
                    Add FAQ
                  </Button>
                </PermissionGate>
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {faqs.map(renderFaqCard)}
            </div>
          )}
        </div>
      )}

      {/* FAQ Add / Edit Modal */}
      <Modal
        open={faqModalOpen}
        onClose={closeFaqModal}
        title={editingFaq ? 'Edit FAQ' : 'Add FAQ'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={closeFaqModal} disabled={savingFaq}>
              Cancel
            </Button>
            <Button onClick={handleSaveFaq} loading={savingFaq}>
              {editingFaq ? 'Save changes' : 'Add FAQ'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Question"
            name="question"
            value={faqForm.question}
            onChange={(e) => setFaqForm((f) => ({ ...f, question: e.target.value }))}
            placeholder="What is your question?"
            required
          />
          <Textarea
            label="Answer"
            name="answer"
            value={faqForm.answer}
            onChange={(e) => setFaqForm((f) => ({ ...f, answer: e.target.value }))}
            placeholder="Provide a clear and concise answer…"
            rows={5}
            required
          />
          <Input
            label="Category"
            name="category"
            value={faqForm.category}
            onChange={(e) => setFaqForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="e.g. General, Billing, Rules…"
          />
          <Select
            label="Status"
            name="status"
            value={faqForm.status}
            onChange={(e) => setFaqForm((f) => ({ ...f, status: e.target.value as ContentStatus }))}
            options={STATUS_OPTIONS}
          />
        </div>
      </Modal>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteFaq}
        title="Delete FAQ"
        message={`Are you sure you want to delete "${deleteTarget?.question}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deletingFaq}
      />
    </div>
  )
}
