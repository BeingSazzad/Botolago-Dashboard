import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, MoreHorizontal, Pencil, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PermissionGate } from '@/components/shared/PermissionGate'
import { SearchInput } from '@/components/shared/SearchInput'
import { Avatar } from '@/components/shared/Avatar'
import { PlayerStatusBadge, PositionBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/Table'
import { Dropdown } from '@/components/ui/Dropdown'
import { Pagination } from '@/components/ui/Pagination'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { POSITION_OPTIONS, PLAYER_STATUS_OPTIONS } from '@/lib/constants'
import type { Position, PlayerStatus, SelectOption } from '@/types/common.types'
import { useGetPlayersQuery } from '@/services/endpoints/playersApi'
import type { Player } from '@/components/players/types'

const PAGE_SIZE = 15

const STATUS_OPTIONS: SelectOption<string>[] = [
  { label: 'All statuses', value: 'all' },
  ...PLAYER_STATUS_OPTIONS,
]

const POSITION_FILTER_OPTIONS: SelectOption<string>[] = [
  { label: 'All positions', value: 'all' },
  ...POSITION_OPTIONS,
]

export function PlayersPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { can } = useAuth()
  const canManage = can('players.manage')

  const [searchRaw, setSearchRaw] = useState('')
  const [positionFilter, setPositionFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState('just now')

  const search = useDebounce(searchRaw, 350)

  const queryParams = {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    position: positionFilter !== 'all' ? (positionFilter as Position) : undefined,
    status: statusFilter !== 'all' ? (statusFilter as PlayerStatus) : undefined,
    sortBy,
    sortDir,
  }

  const { data, isLoading, isFetching, refetch } = useGetPlayersQuery(queryParams)

  const players = data?.items ?? []
  const total = data?.total ?? 0

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  function handleSearchChange(val: string) {
    setSearchRaw(val)
    setPage(1)
  }

  function handlePositionChange(val: string) {
    setPositionFilter(val)
    setPage(1)
  }

  function handleStatusChange(val: string) {
    setStatusFilter(val)
    setPage(1)
  }

  async function handleSync() {
    setSyncing(true)
    try {
      await refetch()
      setLastSynced(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      toast({ variant: 'success', title: 'Players synced', description: 'Latest roster pulled from the data feed.' })
    } finally {
      setSyncing(false)
    }
  }

  const columns: Column<Player>[] = [
    {
      key: 'name',
      header: 'Player',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} src={row.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{row.name}</p>
            <p className="truncate text-xs text-slate-400">{row.clubShort}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Position',
      render: (row) => <PositionBadge position={row.position} />,
    },
    {
      key: 'club',
      header: 'Club',
      render: (row) => <span className="text-slate-600">{row.club}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="whitespace-nowrap font-medium text-slate-700">DH {row.price.toFixed(1)}M</span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span
          className={
            row.rating >= 7
              ? 'font-semibold text-emerald-600'
              : row.rating >= 5
                ? 'font-semibold text-amber-600'
                : 'font-semibold text-rose-500'
          }
        >
          {row.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'totalPoints',
      header: 'Pts',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-medium text-slate-700">{row.totalPoints}</span>,
    },
    {
      key: 'ownership',
      header: 'Owned',
      align: 'right',
      render: (row) => <span className="text-slate-500">{row.ownership.toFixed(1)}%</span>,
    },
    {
      key: 'status',
      header: 'Availability',
      render: (row) => <PlayerStatusBadge status={row.status} />,
    },
    {
      key: '_actions',
      header: '',
      width: '52px',
      align: 'right',
      render: (row) => (
        <Dropdown
          trigger={
            <Button variant="ghost" size="icon" aria-label="Player actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
          items={[
            {
              label: 'View',
              icon: <Eye className="h-4 w-4" />,
              onClick: () => navigate(ROUTES.playerDetail(row.id)),
            },
            ...(canManage
              ? [
                  {
                    label: 'Edit',
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => navigate(`/players/${row.id}/edit`),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Players"
        description="Player roster and match stats are synced from the sports data feed."
        actions={
          <PermissionGate permission="players.manage">
            <Button
              variant="outline"
              leftIcon={<RefreshCw className={syncing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />}
              onClick={handleSync}
              loading={syncing}
            >
              Sync from feed
            </Button>
          </PermissionGate>
        }
      />

      {/* Feed status strip */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Badge variant="success" dot>
          Live feed connected
        </Badge>
        <span className="text-slate-400">Last synced: {lastSynced}</span>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={searchRaw} onChange={handleSearchChange} placeholder="Search players…" />
        <div className="w-44">
          <Select
            options={POSITION_FILTER_OPTIONS}
            value={positionFilter}
            onChange={(e) => handlePositionChange(e.target.value)}
            aria-label="Filter by position"
          />
        </div>
        <div className="w-44">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            aria-label="Filter by availability"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable<Player>
        columns={columns}
        data={players}
        rowKey={(row) => row.id}
        loading={isLoading || isFetching}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        onRowClick={(row) => navigate(ROUTES.playerDetail(row.id))}
        emptyTitle="No players found"
        emptyDescription="Try adjusting your search or filters."
      />

      {/* Pagination */}
      {total > 0 && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      )}
    </div>
  )
}
