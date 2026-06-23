import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { PermissionGate } from '@/components/shared/PermissionGate'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { LoadingState } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ROUTES } from '@/constants/routes'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/lib/utils'
import { useGetFixtureQuery, useUpdateFixtureMutation } from '@/services/endpoints/fixturesApi'
import type { FixtureStatus, SelectOption } from '@/types/common.types'

const DIFFICULTY_OPTIONS: SelectOption<string>[] = [
  { label: '0.8×', value: '0.8' },
  { label: '0.9×', value: '0.9' },
  { label: '1.0×', value: '1.0' },
  { label: '1.1×', value: '1.1' },
  { label: '1.2×', value: '1.2' },
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

export function FixtureDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: fx, isLoading } = useGetFixtureQuery(id ?? '', { skip: !id })

  const [homeDiff, setHomeDiff] = useState<string | null>(null)
  const [awayDiff, setAwayDiff] = useState<string | null>(null)

  const [updateFixture, { isLoading: isSaving }] = useUpdateFixtureMutation()

  if (!id || isLoading) {
    return <LoadingState label="Loading fixture…" />
  }

  if (!fx) {
    return (
      <EmptyState
        title="Fixture not found"
        description="This fixture doesn't exist or has been removed."
        action={
          <Button variant="outline" onClick={() => navigate(ROUTES.fixtures)}>
            Back to fixtures
          </Button>
        }
      />
    )
  }

  // Seed local state from the fixture on first render (homeDiff/awayDiff start as null)
  const resolvedHomeDiff = homeDiff ?? String(fx.homeDifficulty)
  const resolvedAwayDiff = awayDiff ?? String(fx.awayDifficulty)

  const hasScore = fx.status === 'finished' || fx.status === 'live'

  async function handleSaveDifficulty() {
    if (!fx) return
    try {
      await updateFixture({
        id: fx.id,
        changes: {
          homeDifficulty: parseFloat(resolvedHomeDiff),
          awayDifficulty: parseFloat(resolvedAwayDiff),
        },
      }).unwrap()
      toast({
        variant: 'success',
        title: 'Difficulty updated',
        description: `FDR saved for ${fx.homeShort} vs ${fx.awayShort}.`,
      })
    } catch {
      toast({
        variant: 'error',
        title: 'Save failed',
        description: 'Could not update the difficulty. Please try again.',
      })
    }
  }

  return (
    <div>
      <PageHeader
        title={`${fx.homeClub} v ${fx.awayClub}`}
        description={`Gameweek ${fx.gameweek} · ${fx.venue}`}
        breadcrumbs={[
          { label: 'Fixtures', to: ROUTES.fixtures },
          { label: `${fx.homeShort} v ${fx.awayShort}` },
        ]}
      />

      {/* Matchup hero card */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            {/* Home */}
            <div className="min-w-0 flex-1 text-right">
              <p className="text-3xl font-bold text-slate-900">{fx.homeShort}</p>
              <p className="mt-1 truncate text-sm text-slate-500">{fx.homeClub}</p>
            </div>

            {/* Centre: score or "vs" + status */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {hasScore ? (
                <span className="font-mono text-3xl font-bold text-slate-900">
                  {fx.homeScore ?? 0} – {fx.awayScore ?? 0}
                </span>
              ) : (
                <span className="text-xl font-semibold text-slate-300">vs</span>
              )}
              <Badge variant={statusBadgeVariant(fx.status)} dot={fx.status === 'live'}>
                {statusLabel(fx.status)}
              </Badge>
            </div>

            {/* Away */}
            <div className="min-w-0 flex-1 text-left">
              <p className="text-3xl font-bold text-slate-900">{fx.awayShort}</p>
              <p className="mt-1 truncate text-sm text-slate-500">{fx.awayClub}</p>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3">
            <div>
              <p className="font-medium text-slate-500">Kick-off</p>
              <p className="mt-1 font-semibold text-slate-800">{formatDate(fx.kickoff, true)}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Venue</p>
              <p className="mt-1 font-semibold text-slate-800">{fx.venue}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Gameweek</p>
              <p className="mt-1 font-semibold text-slate-800">GW {fx.gameweek}</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Synced from data feed (read-only) — match data is updated automatically and cannot be
            edited here.
          </p>
        </CardContent>
      </Card>

      {/* FDR card */}
      <Card className="mt-6">
        <CardHeader
          title="Fixture Difficulty (FDR)"
          description="The multiplier is applied to every player's score in this fixture. A value above 1.0× boosts scores; below 1.0× reduces them."
        />
        <CardContent>
          <PermissionGate
            permission="fixtures.manage"
            fallback={
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="font-medium text-slate-500">Home ({fx.homeShort})</p>
                  <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-semibold text-blue-700">
                    {fx.homeDifficulty.toFixed(1)}×
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-500">Away ({fx.awayShort})</p>
                  <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold text-slate-600">
                    {fx.awayDifficulty.toFixed(1)}×
                  </span>
                </div>
              </div>
            }
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label={`Home difficulty (${fx.homeShort})`}
                  name="homeDifficulty"
                  options={DIFFICULTY_OPTIONS}
                  value={resolvedHomeDiff}
                  onChange={(e) => setHomeDiff(e.target.value)}
                />
                <Select
                  label={`Away difficulty (${fx.awayShort})`}
                  name="awayDifficulty"
                  options={DIFFICULTY_OPTIONS}
                  value={resolvedAwayDiff}
                  onChange={(e) => setAwayDiff(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  Difficulty multiplies each player's score for this fixture.
                </p>
                <Button loading={isSaving} onClick={handleSaveDifficulty}>
                  Save difficulty
                </Button>
              </div>
            </div>
          </PermissionGate>
        </CardContent>
      </Card>
    </div>
  )
}
