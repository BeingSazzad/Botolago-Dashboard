import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/shared/Avatar'
import { SearchInput } from '@/components/shared/SearchInput'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { useDebounce } from '@/hooks/useDebounce'
import { formatNumber } from '@/lib/utils'
import { useGetTeamsQuery } from '@/services/endpoints/usersApi'
import { ROUTES } from '@/constants/routes'
import type { FantasyTeam } from '@/components/users/types'

const PAGE_SIZE = 10

export function TeamsPage() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('points')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const debouncedSearch = useDebounce(search)

  const { data, isFetching } = useGetTeamsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    sortBy,
    sortDir,
  })

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

  const columns: Column<FantasyTeam>[] = [
    {
      key: 'rank',
      header: 'Rank',
      width: '64px',
      align: 'center',
      render: (t) => (
        <span
          className={
            t.rank <= 3
              ? 'text-sm font-bold text-amber-500'
              : 'text-sm font-semibold text-slate-400'
          }
        >
          #{t.rank}
        </span>
      ),
    },
    {
      key: 'teamName',
      header: 'Team',
      render: (t) => (
        <span className="font-semibold text-slate-800">{t.teamName}</span>
      ),
    },
    {
      key: 'ownerName',
      header: 'Manager',
      render: (t) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={t.ownerName} size="sm" />
          <span className="text-sm text-slate-700">{t.ownerName}</span>
        </div>
      ),
    },
    {
      key: 'formation',
      header: 'Formation',
      render: (t) => <Badge variant="primary">{t.formation}</Badge>,
    },
    {
      key: 'squadValue',
      header: 'Squad Value',
      align: 'right',
      render: (t) => (
        <span className="font-medium text-slate-700">£{t.squadValue.toFixed(1)}m</span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      align: 'right',
      render: (t) => (
        <span className="text-slate-600">£{t.budget.toFixed(1)}m</span>
      ),
    },
    {
      key: 'gwPoints',
      header: 'GW Pts',
      align: 'right',
      sortable: true,
      render: (t) => (
        <span className="font-semibold text-primary-700">{t.gwPoints}</span>
      ),
    },
    {
      key: 'points',
      header: 'Total Pts',
      align: 'right',
      sortable: true,
      render: (t) => (
        <span className="font-bold text-slate-900">{formatNumber(t.points)}</span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Fantasy Teams"
        description="Overview of all active fantasy squads and their performance."
        actions={
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Trophy className="h-4 w-4" />
            {data ? formatNumber(data.total) : '—'} teams
          </div>
        }
      />

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search teams or managers…"
        />
      </div>

      {/* Table */}
      <DataTable<FantasyTeam>
        columns={columns}
        data={data?.items ?? []}
        rowKey={(t) => t.id}
        loading={isFetching}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        onRowClick={(t) => navigate(ROUTES.teamDetail(t.id))}
        emptyTitle="No teams found"
        emptyDescription="Try adjusting your search term."
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
    </div>
  )
}
