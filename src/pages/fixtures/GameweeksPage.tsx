import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, CheckCircle2, Layers, Zap } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/Table'
import { formatDate, formatNumber } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import type { GameweekStatus, SelectOption } from '@/types/common.types'
import type { Gameweek } from '@/components/fixtures/types'
import { useGetGameweeksQuery } from '@/services/endpoints/fixturesApi'

const STATUS_OPTIONS: SelectOption<string>[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Live', value: 'live' },
  { label: 'Finished', value: 'finished' },
]

function gwStatusVariant(status: GameweekStatus) {
  switch (status) {
    case 'live':
      return 'success'
    case 'finished':
      return 'neutral'
    case 'upcoming':
      return 'info'
  }
}

function gwStatusLabel(status: GameweekStatus) {
  switch (status) {
    case 'live':
      return 'Live'
    case 'finished':
      return 'Finished'
    case 'upcoming':
      return 'Upcoming'
  }
}

export function GameweeksPage() {
  const navigate = useNavigate()
  const { data: gameweeks = [], isLoading } = useGetGameweeksQuery()
  const [statusFilter, setStatusFilter] = useState('all')

  const totalGw = gameweeks.length
  const liveGw = gameweeks.find((gw) => gw.status === 'live')
  const finishedCount = gameweeks.filter((gw) => gw.status === 'finished').length
  const upcomingCount = gameweeks.filter((gw) => gw.status === 'upcoming').length

  const rows = statusFilter === 'all' ? gameweeks : gameweeks.filter((gw) => gw.status === statusFilter)

  const columns: Column<Gameweek>[] = [
    {
      key: 'number',
      header: 'GW',
      width: '88px',
      render: (gw) => (
        <span className="inline-flex items-center whitespace-nowrap rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-bold text-primary-700">
          GW {gw.number}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Gameweek',
      render: (gw) => <span className="font-semibold text-slate-800">{gw.name}</span>,
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (gw) => (
        <span className="flex items-center gap-1.5 text-slate-600">
          <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
          {formatDate(gw.deadline, true)}
        </span>
      ),
    },
    {
      key: 'fixtures',
      header: 'Fixtures',
      align: 'center',
      render: (gw) => <span className="text-slate-600">{gw.fixtures}</span>,
    },
    {
      key: 'averagePoints',
      header: 'Avg Pts',
      align: 'center',
      render: (gw) =>
        gw.status === 'upcoming' ? (
          <span className="text-slate-300">—</span>
        ) : (
          <span className="font-medium text-slate-700">{formatNumber(gw.averagePoints)}</span>
        ),
    },
    {
      key: 'highestPoints',
      header: 'Highest',
      align: 'center',
      render: (gw) =>
        gw.status === 'upcoming' ? (
          <span className="text-slate-300">—</span>
        ) : (
          <span className="font-medium text-slate-700">{formatNumber(gw.highestPoints)}</span>
        ),
    },
    {
      key: 'mostCaptained',
      header: 'Top Pick',
      render: (gw) =>
        gw.status === 'upcoming' ? (
          <span className="text-slate-300">—</span>
        ) : (
          <span className="font-medium text-slate-700">{gw.mostCaptained}</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (gw) => (
        <Badge variant={gwStatusVariant(gw.status)} dot={gw.status === 'live'}>
          {gwStatusLabel(gw.status)}
        </Badge>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Gameweeks"
        description="Track gameweek deadlines, fixture counts, and scoring summaries."
      />

      {/* Summary stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Gameweeks" value={totalGw} icon={<Layers className="h-5 w-5" />} />
        <StatCard
          label="Live Gameweek"
          value={liveGw ? `GW ${liveGw.number}` : '—'}
          icon={<Zap className="h-5 w-5" />}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Finished"
          value={finishedCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconClassName="bg-slate-100 text-slate-500"
        />
        <StatCard
          label="Upcoming"
          value={upcomingCount}
          icon={<CalendarClock className="h-5 w-5" />}
          iconClassName="bg-sky-50 text-sky-600"
        />
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="w-44">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          />
        </div>
      </div>

      {/* Gameweeks table */}
      <DataTable<Gameweek>
        columns={columns}
        data={rows}
        rowKey={(gw) => gw.id}
        loading={isLoading}
        onRowClick={(gw) => navigate(ROUTES.gameweekDetail(gw.id))}
        emptyTitle="No gameweeks"
        emptyDescription="Gameweeks will appear here once the season is configured."
      />
    </div>
  )
}
