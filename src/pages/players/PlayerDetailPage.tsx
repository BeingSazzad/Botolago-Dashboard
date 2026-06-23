import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Star, Trophy, PoundSterling, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PermissionGate } from '@/components/shared/PermissionGate'
import { Avatar } from '@/components/shared/Avatar'
import { PlayerStatusBadge, PositionBadge } from '@/components/shared/StatusBadge'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { LoadingState } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ROUTES } from '@/constants/routes'
import { computeRating, SCORING_WEIGHTS, MINUTES_UNIT } from '@/lib/scoring'
import { round } from '@/lib/utils'
import { useGetPlayerQuery } from '@/services/endpoints/playersApi'

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: player, isLoading } = useGetPlayerQuery(id ?? '', { skip: !id })

  if (!id || isLoading) {
    return <LoadingState label="Loading player…" />
  }

  if (!player) {
    return (
      <EmptyState
        title="Player not found"
        description="This player doesn't exist or has been removed."
        action={
          <Button variant="outline" onClick={() => navigate(ROUTES.players)}>
            Back to players
          </Button>
        }
      />
    )
  }

  const rating = computeRating(player.position, player.lastStats)
  const weights = SCORING_WEIGHTS[player.position]

  return (
    <div>
      <PageHeader
        title={player.name}
        breadcrumbs={[
          { label: 'Players', to: ROUTES.players },
          { label: player.name },
        ]}
        actions={
          <PermissionGate permission="players.manage">
            <Button
              variant="outline"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => navigate(`/players/${player.id}/edit`)}
            >
              Edit player
            </Button>
          </PermissionGate>
        }
      />

      {/* Profile card */}
      <Card>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar
            name={player.name}
            src={player.avatarUrl}
            size="lg"
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{player.name}</h2>
              <PositionBadge position={player.position} />
              <PlayerStatusBadge status={player.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              <span>
                <span className="font-medium text-slate-700">{player.club}</span>
                {' '}
                <span className="text-slate-400">({player.clubShort})</span>
              </span>
              <span>
                #{player.jerseyNumber}
              </span>
              <span>{player.nationality}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI tiles */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Rating"
          value={`${rating.scoreOutOf10.toFixed(1)} / 10`}
          icon={<Star className="h-5 w-5" />}
          hint="Latest match rating"
        />
        <StatCard
          label="Total Points"
          value={player.totalPoints}
          icon={<Trophy className="h-5 w-5" />}
          hint="This season"
          iconClassName="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Price"
          value={`DH ${player.price.toFixed(1)}M`}
          icon={<PoundSterling className="h-5 w-5" />}
          hint="Transfer value"
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Ownership"
          value={`${player.ownership.toFixed(1)}%`}
          icon={<Users className="h-5 w-5" />}
          hint="Fantasy squads"
          iconClassName="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Scoring breakdown */}
      <Card className="mt-6">
        <CardHeader
          title="Scoring breakdown"
          description={`Position-weighted scoring for ${player.position} — latest match stats`}
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Stat
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Value
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Weight
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {weights.map(({ key, label, weight }) => {
                  const rawValue = player.lastStats[key]
                  const effectiveValue =
                    key === 'M' ? rawValue / MINUTES_UNIT : rawValue
                  const contribution = round(effectiveValue * weight, 2)

                  return (
                    <tr key={key} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-700">
                        <span className="font-medium">{label}</span>
                        {key === 'M' && (
                          <span className="ml-1.5 text-xs text-slate-400">(per {MINUTES_UNIT} min)</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-600">
                        {key === 'M' ? (
                          <span>
                            {rawValue}{' '}
                            <span className="text-xs text-slate-400">
                              → {(rawValue / MINUTES_UNIT).toFixed(2)} units
                            </span>
                          </span>
                        ) : (
                          rawValue
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={
                            weight < 0
                              ? 'font-medium text-rose-600'
                              : 'font-medium text-slate-600'
                          }
                        >
                          {weight > 0 ? `+${weight}` : weight}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={
                            contribution < 0
                              ? 'font-semibold text-rose-600'
                              : contribution > 0
                              ? 'font-semibold text-emerald-700'
                              : 'text-slate-400'
                          }
                        >
                          {contribution > 0 ? `+${contribution}` : contribution}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td
                    colSpan={3}
                    className="px-5 py-4 text-sm font-semibold text-slate-700"
                  >
                    Base score
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-bold text-slate-900">
                    {rating.baseScore.toFixed(2)}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td
                    colSpan={3}
                    className="px-5 py-2 text-sm font-semibold text-slate-700"
                  >
                    Final rating
                    <span className="ml-1.5 text-xs font-normal text-slate-400">
                      (after bonus &amp; difficulty ×1.0)
                    </span>
                  </td>
                  <td className="px-5 py-2 text-right text-sm font-bold text-slate-900">
                    {rating.finalRating.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t border-slate-200 bg-primary-50">
                  <td
                    colSpan={3}
                    className="px-5 py-4 text-sm font-bold text-primary-700"
                  >
                    Score out of 10
                    <span className="ml-1.5 text-xs font-normal text-primary-500">
                      (normalised ÷ 30 × 10, clamped 0–10)
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-lg font-bold text-primary-700">
                    {rating.scoreOutOf10.toFixed(1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
