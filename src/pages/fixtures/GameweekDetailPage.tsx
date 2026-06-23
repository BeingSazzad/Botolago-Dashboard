import { useNavigate, useParams } from 'react-router-dom'
import { BarChart3, CalendarClock, Star, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/Table'
import { LoadingState } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatNumber } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import type { FixtureStatus, GameweekStatus } from '@/types/common.types'
import type { Fixture } from '@/components/fixtures/types'
import { useGetGameweeksQuery, useGetFixturesQuery } from '@/services/endpoints/fixturesApi'

const GW_VARIANT: Record<GameweekStatus, BadgeVariant> = {
  upcoming: 'info',
  live: 'success',
  finished: 'neutral',
}

const FX_VARIANT: Record<FixtureStatus, BadgeVariant> = {
  scheduled: 'info',
  live: 'success',
  finished: 'neutral',
  postponed: 'warning',
}

export function GameweekDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: gameweeks = [], isLoading } = useGetGameweeksQuery()
  const gw = gameweeks.find((g) => g.id === id)

  const { data: fixturesData, isFetching } = useGetFixturesQuery(
    { gameweek: gw?.number, pageSize: 20 },
    { skip: !gw },
  )
  const fixtures = fixturesData?.items ?? []

  if (isLoading) return <LoadingState label="Loading gameweek…" />
  if (!gw) {
    return (
      <EmptyState
        title="Gameweek not found"
        action={<Button onClick={() => navigate(ROUTES.gameweeks)}>Back to gameweeks</Button>}
      />
    )
  }

  const isUpcoming = gw.status === 'upcoming'

  const columns: Column<Fixture>[] = [
    {
      key: 'match',
      header: 'Match',
      align: 'center',
      render: (f) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{f.homeClub}</span>
          <span className="flex h-6 w-9 shrink-0 items-center justify-center rounded bg-slate-100 text-[11px] font-bold text-slate-600">
            {f.homeShort}
          </span>
          <span className="w-16 shrink-0 text-center font-mono text-sm font-bold text-slate-900">
            {f.status === 'scheduled' || f.status === 'postponed'
              ? new Date(f.kickoff).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
              : `${f.homeScore ?? 0}–${f.awayScore ?? 0}`}
          </span>
          <span className="flex h-6 w-9 shrink-0 items-center justify-center rounded bg-slate-100 text-[11px] font-bold text-slate-600">
            {f.awayShort}
          </span>
          <span className="text-sm font-semibold text-slate-800">{f.awayClub}</span>
        </div>
      ),
    },
    { key: 'venue', header: 'Venue', render: (f) => <span className="text-slate-500">{f.venue}</span> },
    {
      key: 'kickoff',
      header: 'Kick-off',
      render: (f) => <span className="text-slate-600">{formatDate(f.kickoff, true)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (f) => (
        <Badge variant={FX_VARIANT[f.status]} dot={f.status === 'live'}>
          {f.status}
        </Badge>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={gw.name}
        description={`Deadline ${formatDate(gw.deadline, true)}`}
        breadcrumbs={[{ label: 'Gameweeks', to: ROUTES.gameweeks }, { label: gw.name }]}
        actions={
          <Badge variant={GW_VARIANT[gw.status]} dot={gw.status === 'live'}>
            {gw.status}
          </Badge>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fixtures" value={gw.fixtures} icon={<CalendarClock className="h-5 w-5" />} />
        <StatCard
          label="Average points"
          value={isUpcoming ? '—' : formatNumber(gw.averagePoints)}
          icon={<BarChart3 className="h-5 w-5" />}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Highest points"
          value={isUpcoming ? '—' : formatNumber(gw.highestPoints)}
          icon={<Trophy className="h-5 w-5" />}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Most captained"
          value={isUpcoming ? '—' : gw.mostCaptained}
          icon={<Star className="h-5 w-5" />}
          iconClassName="bg-violet-50 text-violet-600"
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Fixtures</h2>
      <DataTable<Fixture>
        columns={columns}
        data={fixtures}
        rowKey={(f) => f.id}
        loading={isFetching}
        onRowClick={(f) => navigate(ROUTES.fixtureDetail(f.id))}
        emptyTitle="No fixtures"
        emptyDescription="Fixtures for this gameweek will appear here once scheduled."
      />
    </div>
  )
}
