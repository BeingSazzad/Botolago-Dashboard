import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, ShieldAlert, ShieldCheck, ShieldOff, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/shared/Avatar'
import { PermissionGate } from '@/components/shared/PermissionGate'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable, type Column } from '@/components/ui/Table'
import { Dropdown } from '@/components/ui/Dropdown'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import { formatDate, formatNumber } from '@/lib/utils'
import {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
} from '@/services/endpoints/usersApi'
import { ROUTES } from '@/constants/routes'
import type { EntityStatus, SelectOption } from '@/types/common.types'
import type { User } from '@/components/users/types'

const PAGE_SIZE = 10

const STATUS_OPTIONS: SelectOption<string>[] = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Banned', value: 'banned' },
  { label: 'Pending', value: 'pending' },
]

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function UsersPage() {
  const navigate = useNavigate()
  const toast = useToast()

  // Query state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('totalPoints')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const debouncedSearch = useDebounce(search)

  const { data, isFetching } = useGetUsersQuery({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortDir,
  })

  // Ban confirm dialog
  const [banTarget, setBanTarget] = useState<User | null>(null)

  const [updateStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation()

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('desc')
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value)
    setPage(1)
  }

  async function handleStatusUpdate(user: User, status: EntityStatus) {
    try {
      await updateStatus({ id: user.id, status }).unwrap()
      toast({ type: 'success', title: 'Status updated', message: `${user.name} is now ${status}.` })
    } catch {
      toast({ type: 'error', title: 'Update failed', message: 'Could not update user status.' })
    }
  }

  async function handleBanConfirm() {
    if (!banTarget) return
    await handleStatusUpdate(banTarget, 'banned')
    setBanTarget(null)
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} src={u.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{u.name}</p>
            <p className="truncate text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'username',
      header: 'Username',
      render: (u) => <span className="text-slate-500">@{u.username}</span>,
    },
    {
      key: 'teamName',
      header: 'Team',
      render: (u) => <span className="font-medium text-slate-700">{u.teamName}</span>,
    },
    {
      key: 'country',
      header: 'Country',
      render: (u) => <span className="text-slate-600">{u.country}</span>,
    },
    {
      key: 'totalPoints',
      header: 'Total Pts',
      align: 'right',
      sortable: true,
      render: (u) => (
        <span className="font-semibold text-slate-800">{formatNumber(u.totalPoints)}</span>
      ),
    },
    {
      key: 'rank',
      header: 'Rank',
      align: 'right',
      sortable: true,
      render: (u) => <span className="text-slate-500">#{u.rank}</span>,
    },
    {
      key: 'leagues',
      header: 'Leagues',
      align: 'center',
      render: (u) => <span className="text-slate-600">{u.leagues}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'lastActiveAt',
      header: 'Last active',
      render: (u) => <span className="text-slate-400">{formatDate(u.lastActiveAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '48px',
      render: (u) => (
        <PermissionGate permission="users.manage">
          <Dropdown
            trigger={
              <Button variant="ghost" size="icon" aria-label="Actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                label: 'Activate',
                icon: <ShieldCheck className="h-4 w-4" />,
                onClick: () => handleStatusUpdate(u, 'active'),
                disabled: u.status === 'active',
              },
              {
                label: 'Suspend',
                icon: <ShieldOff className="h-4 w-4" />,
                onClick: () => handleStatusUpdate(u, 'suspended'),
                disabled: u.status === 'suspended',
              },
              {
                label: 'Ban user',
                icon: <ShieldAlert className="h-4 w-4" />,
                onClick: () => setBanTarget(u),
                destructive: true,
                disabled: u.status === 'banned',
              },
            ]}
          />
        </PermissionGate>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Users"
        description="Browse and manage all registered fantasy football managers."
        actions={
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="h-4 w-4" />
            {data ? formatNumber(data.total) : '—'} total
          </div>
        }
      />

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search users…"
        />
        <div className="w-48">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            aria-label="Filter by status"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable<User>
        columns={columns}
        data={data?.items ?? []}
        rowKey={(u) => u.id}
        loading={isFetching}
        onRowClick={(u) => navigate(ROUTES.userDetail(u.id))}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        emptyTitle="No users found"
        emptyDescription="Try adjusting the search or status filter."
      />

      {/* Pagination */}
      {data && (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      {/* Ban confirmation */}
      <ConfirmDialog
        open={banTarget !== null}
        onClose={() => setBanTarget(null)}
        onConfirm={handleBanConfirm}
        title="Ban user"
        message={`Are you sure you want to ban ${banTarget?.name ?? 'this user'}? They will lose access to the platform immediately.`}
        confirmLabel="Ban user"
        destructive
        loading={isUpdating}
      />
    </div>
  )
}
