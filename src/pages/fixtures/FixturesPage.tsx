import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, CalendarClock, Activity, CheckCircle2, Clock } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PermissionGate } from '@/components/shared/PermissionGate'
import { StatCard } from '@/components/shared/StatCard'
import { SearchInput } from '@/components/shared/SearchInput'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/lib/utils'
import { CLUBS } from '@/lib/constants'
import { ROUTES } from '@/constants/routes'
import type { FixtureStatus, SelectOption } from '@/types/common.types'
import type { Fixture } from '@/components/fixtures/types'
import {
  useGetFixturesQuery,
  useGetGameweeksQuery,
} from '@/services/endpoints/fixturesApi'

const PAGE_SIZE = 15

const STATUS_OPTIONS: SelectOption<string>[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Live', value: 'live' },
  { label: 'Finished', value: 'finished' },
  { label: 'Postponed', value: 'postponed' },
]

function statusBadgeVariant(status: FixtureStatus) {
  switch (status) {
    case 'live':
      return 'success' as const
    case 'finished':
      return 'neutral' as const
    case 'scheduled':
      return 'info' as const
    case 'postponed':
      return 'warning' as const
  }
}

function statusLabel(status: FixtureStatus) {
  switch (status) {
    case 'live':
      return 'Live'
    case 'finished':
      return 'Finished'
    case 'scheduled':
      return 'Scheduled'
    case 'postponed':
      return 'Postponed'
  }
}

function getShort(clubName: string): string {
  return CLUBS.find((c) => c.name === clubName)?.short ?? clubName.slice(0, 3).toUpperCase()
}

function formatLastSynced(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function FixturesPage() {
  const toast = useToast()
  const navigate = useNavigate()

  // Sync state
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<string>(formatLastSynced(new Date()))

  // Filter + pagination state
  const [searchRaw, setSearchRaw] = useState('')
  const [gwFilter, setGwFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const search = useDebounce(searchRaw, 350)

  const queryParams = {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    gameweek: gwFilter !== 'all' ? gwFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  }

  const { data, isLoading, isFetching, refetch } = useGetFixturesQuery(queryParams)
  const { data: gameweeks = [] } = useGetGameweeksQuery()

  const fixtures = data?.items ?? []
  const total = data?.total ?? 0

  // Stat counts derived from current page data
  const liveCount = fixtures.filter((f) => f.status === 'live').length
  const finishedCount = fixtures.filter((f) => f.status === 'finished').length
  const scheduledCount = fixtures.filter((f) => f.status === 'scheduled').length

  const gameweekFilterOptions: SelectOption<string>[] = [
    { label: 'All gameweeks', value: 'all' },
    ...gameweeks.map((gw) => ({ label: `GW ${gw.number}`, value: String(gw.number) })),
  ]

  function handleSearchChange(val: string) {
    setSearchRaw(val)
    setPage(1)
  }

  function handleGwChange(val: string) {
    setGwFilter(val)
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
      const now = formatLastSynced(new Date())
      setLastSynced(now)
      toast({
        variant: 'success',
        title: 'Fixtures synced',
        description: `Feed pulled successfully at ${now}.`,
      })
    } finally {
      setSyncing(false)
    }
  }

  const columns: Column<Fixture>[] = [
    {
      key: 'gameweek',
      header: 'GW',
      width: '64px',
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
          GW {row.gameweek}
        </span>
      ),
    },
    {
      key: 'match',
      header: 'Match',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate font-semibold text-slate-800">{getShort(row.homeClub)}</p>
            <p className="truncate text-xs text-slate-400">{row.homeClub}</p>
          </div>
          <span className="shrink-0 text-xs font-bold text-slate-400">v</span>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-semibold text-slate-800">{getShort(row.awayClub)}</p>
            <p className="truncate text-xs text-slate-400">{row.awayClub}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      align: 'center',
      width: '80px',
      render: (row) =>
        row.status === 'finished' || row.status === 'live' ? (
          <span className="font-mono font-semibold text-slate-800">
            {row.homeScore ?? 0} – {row.awayScore ?? 0}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      key: 'kickoff',
      header: 'Kick-off',
      render: (row) => (
        <span className="text-slate-600">{formatDate(row.kickoff, true)}</span>
      ),
    },
    {
      key: 'venue',
      header: 'Venue',
      render: (row) => <span className="text-slate-500">{row.venue}</span>,
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
            H {row.homeDifficulty.toFixed(1)}×
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
            A {row.awayDifficulty.toFixed(1)}×
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={statusBadgeVariant(row.status)} dot={row.status === 'live'}>
          {statusLabel(row.status)}
        </Badge>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Fixtures"
        description="Synced from the live sports data feed — results update automatically."
        actions={
          <PermissionGate permission="fixtures.manage">
            <Button
              variant="outline"
              leftIcon={<RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />}
              loading={syncing}
              onClick={handleSync}
            >
              Sync from feed
            </Button>
          </PermissionGate>
        }
      />

      {/* Feed status strip */}
      <div className="mb-5 flex items-center gap-3 text-sm text-slate-500">
        <Badge variant="success" dot>
          Live feed connected
        </Badge>
        <span>Last synced: {lastSynced}</span>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total (page)"
          value={fixtures.length}
          icon={<CalendarClock className="h-5 w-5" />}
          hint="on this page"
        />
        <StatCard
          label="Live now"
          value={liveCount}
          icon={<Activity className="h-5 w-5" />}
          iconClassName="bg-emerald-50 text-emerald-600"
          hint="on this page"
        />
        <StatCard
          label="Finished"
          value={finishedCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconClassName="bg-slate-100 text-slate-500"
          hint="on this page"
        />
        <StatCard
          label="Scheduled"
          value={scheduledCount}
          icon={<Clock className="h-5 w-5" />}
          iconClassName="bg-sky-50 text-sky-600"
          hint="on this page"
        />
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchRaw}
          onChange={handleSearchChange}
          placeholder="Search fixtures…"
        />
        <div className="w-44">
          <Select
            options={gameweekFilterOptions}
            value={gwFilter}
            onChange={(e) => handleGwChange(e.target.value)}
            aria-label="Filter by gameweek"
          />
        </div>
        <div className="w-44">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            aria-label="Filter by status"
          />
        </div>
      </div>

      {/* Read-only table — click a row to navigate to the fixture detail page */}
      <DataTable<Fixture>
        columns={columns}
        data={fixtures}
        rowKey={(row) => row.id}
        loading={isLoading || isFetching}
        onRowClick={(row) => navigate(ROUTES.fixtureDetail(row.id))}
        emptyTitle="No fixtures found"
        emptyDescription="Try adjusting your search or filters."
      />

      {/* Pagination */}
      {total > 0 && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      )}
    </div>
  )
}
