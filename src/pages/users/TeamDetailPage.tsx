import { Link, useNavigate, useParams } from 'react-router-dom'
import { Globe, Mail, Trophy, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/shared/Avatar'
import { PositionBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ROUTES } from '@/constants/routes'
import { formatNumber } from '@/lib/utils'
import { useGetTeamQuery } from '@/services/endpoints/usersApi'
import type { SquadPlayer } from '@/components/users/types'
import type { Position } from '@/types/common.types'

// ---------------------------------------------------------------------------
// Position ordering helper
// ---------------------------------------------------------------------------
const POSITION_ORDER: Record<Position, number> = {
  Goalkeeper: 0,
  Defender: 1,
  Midfielder: 2,
  Forward: 3,
}

function sortByPosition(a: SquadPlayer, b: SquadPlayer): number {
  return POSITION_ORDER[a.position] - POSITION_ORDER[b.position]
}

// ---------------------------------------------------------------------------
// Squad section sub-component
// ---------------------------------------------------------------------------
interface SquadSectionProps {
  label: string
  players: SquadPlayer[]
}

function SquadSection({ label, players }: SquadSectionProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
        {players.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
            <PositionBadge position={p.position} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium text-slate-800">{p.name}</span>
                {p.isCaptain && (
                  <Badge variant="primary" className="px-1.5 py-0 text-[10px] font-bold leading-4">
                    C
                  </Badge>
                )}
                {p.isViceCaptain && (
                  <Badge variant="info" className="px-1.5 py-0 text-[10px] font-bold leading-4">
                    V
                  </Badge>
                )}
              </div>
              <span className="text-xs text-slate-400">{p.clubShort}</span>
            </div>

            <span className="w-10 text-right text-xs text-slate-400">
              {p.rating.toFixed(1)}
            </span>

            <span className="w-8 text-right text-sm font-bold text-primary-700">
              {p.gwPoints}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: team, isLoading } = useGetTeamQuery(id ?? '', { skip: !id })

  if (!id || isLoading) {
    return <LoadingState label="Loading team…" />
  }

  if (!team) {
    return (
      <EmptyState
        title="Team not found"
        description="This team doesn't exist or has been removed."
        action={
          <Button variant="outline" onClick={() => navigate(ROUTES.teams)}>
            Back to teams
          </Button>
        }
      />
    )
  }

  const startingXI = [...team.squad.filter((p) => p.isStarting)].sort(sortByPosition)
  const bench = [...team.squad.filter((p) => !p.isStarting)].sort(sortByPosition)

  return (
    <div>
      <PageHeader
        title={team.teamName}
        description={`Managed by ${team.ownerName}`}
        breadcrumbs={[
          { label: 'Teams', to: ROUTES.teams },
          { label: team.teamName },
        ]}
      />

      <div className="space-y-6">
        {/* Two-column layout on medium+ screens */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Owner card */}
          <Card>
            <CardHeader title="Owner" />
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar name={team.ownerName} size="lg" className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={ROUTES.userDetail(team.ownerId)}
                    className="text-base font-semibold text-slate-900 transition-colors hover:text-primary-600"
                  >
                    {team.ownerName}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {team.ownerEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      {team.ownerCountry}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      Rank&nbsp;
                      <span className="font-semibold text-slate-700">#{team.rank}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-primary-500" />
                      <span className="font-semibold text-slate-700">{team.joinedLeagues}</span>
                      &nbsp;leagues
                    </span>
                    <span className="text-slate-400">
                      <span className="font-semibold text-slate-700">{team.totalTransfers}</span>
                      &nbsp;transfers
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats grid */}
          <Card>
            <CardHeader title="Stats" />
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Total Points
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatNumber(team.points)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    GW Points
                  </p>
                  <p className="mt-1 text-2xl font-bold text-primary-700">{team.gwPoints}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Squad Value
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    £{team.squadValue.toFixed(1)}m
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    In the Bank
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    £{team.budget.toFixed(1)}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formation + Chips row */}
        <div className="flex flex-wrap items-start gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              Formation
            </p>
            <Badge variant="primary" className="text-sm font-semibold">
              {team.formation}
            </Badge>
          </div>
          <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              Chips Used
            </p>
            {team.chipsUsed.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {team.chipsUsed.map((chip) => (
                  <Badge key={chip} variant="warning">
                    {chip}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400">None used</span>
            )}
          </div>
        </div>

        {/* Squad sheet */}
        <Card>
          <CardHeader
            title="Squad"
            description="Starting XI and bench players for this gameweek."
          />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Player</span>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Rating</span>
                  <span className="w-8 text-right">GW Pts</span>
                </div>
              </div>

              {startingXI.length > 0 && (
                <SquadSection label="Starting XI" players={startingXI} />
              )}
              {bench.length > 0 && (
                <SquadSection label="Bench" players={bench} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
