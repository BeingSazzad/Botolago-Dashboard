import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { PositionBadge } from '@/components/shared/StatusBadge'
import { Avatar } from '@/components/shared/Avatar'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/constants/routes'
import { PLAYER_STATUS_OPTIONS } from '@/lib/constants'
import { computeRating, EMPTY_STATS } from '@/lib/scoring'
import type { MatchStats, PlayerStatus, SelectOption } from '@/types/common.types'
import { useGetPlayerQuery, useUpdatePlayerMutation } from '@/services/endpoints/playersApi'

const STATUS_OPTIONS = PLAYER_STATUS_OPTIONS as SelectOption<string>[]

const STAT_FIELDS: { key: keyof MatchStats; label: string; hint?: string }[] = [
  { key: 'G', label: 'Goals' },
  { key: 'A', label: 'Assists' },
  { key: 'CS', label: 'Clean Sheet', hint: '0 or 1' },
  { key: 'SoT', label: 'Shots on Target' },
  { key: 'T', label: 'Tackles' },
  { key: 'S', label: 'Saves (GK)' },
  { key: 'M', label: 'Minutes Played' },
  { key: 'YC', label: 'Yellow Cards' },
  { key: 'RC', label: 'Red Cards' },
  { key: 'OG', label: 'Own Goals' },
]

function ReadOnlyField({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

export function PlayerFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: player, isLoading } = useGetPlayerQuery(id ?? '', { skip: !id })
  const [updatePlayer, { isLoading: isSaving }] = useUpdatePlayerMutation()

  // Only the admin-editable (fantasy-owned + correction) fields are stateful.
  const [price, setPrice] = useState(0)
  const [status, setStatus] = useState<PlayerStatus>('available')
  const [stats, setStats] = useState<MatchStats>({ ...EMPTY_STATS })

  useEffect(() => {
    if (player) {
      setPrice(player.price)
      setStatus(player.status)
      setStats({ ...player.lastStats })
    }
  }, [player])

  function setStatField(key: keyof MatchStats, raw: string) {
    const val = parseFloat(raw)
    setStats((prev) => ({ ...prev, [key]: isNaN(val) ? 0 : val }))
  }

  async function handleSave() {
    if (!id) return
    try {
      await updatePlayer({ id, changes: { price, status, lastStats: stats } }).unwrap()
      toast({ variant: 'success', title: 'Player updated', description: `${player?.name} has been updated.` })
      navigate(ROUTES.playerDetail(id))
    } catch {
      toast({ variant: 'error', title: 'Update failed', description: 'An error occurred. Please try again.' })
    }
  }

  if (isLoading) return <LoadingState label="Loading player…" />

  if (!player) {
    return (
      <EmptyState
        title="Player not found"
        description="This player may have been removed from the feed."
        action={<Button onClick={() => navigate(ROUTES.players)}>Back to players</Button>}
      />
    )
  }

  const rating = computeRating(player.position, stats)

  return (
    <div>
      <PageHeader
        title="Manage player"
        description="Identity & match stats come from the data feed. Edit price, availability, or correct stats."
        breadcrumbs={[
          { label: 'Players', to: ROUTES.players },
          { label: player.name, to: ROUTES.playerDetail(player.id) },
          { label: 'Manage' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Identity — read-only from the feed */}
          <Card>
            <CardHeader
              title="Player (from data feed)"
              description="Synced automatically — not editable."
              action={
                <Badge variant="neutral" dot>
                  Synced
                </Badge>
              }
            />
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={player.name} src={player.avatarUrl} size="lg" />
                <div>
                  <p className="text-lg font-semibold text-slate-900">{player.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <PositionBadge position={player.position} />
                    <span className="text-sm text-slate-500">{player.club}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <ReadOnlyField label="Nationality" value={player.nationality} />
                <ReadOnlyField label="Jersey" value={`#${player.jerseyNumber}`} />
                <ReadOnlyField label="Total points" value={player.totalPoints} />
                <ReadOnlyField label="Ownership" value={`${player.ownership.toFixed(1)}%`} />
              </div>
            </CardContent>
          </Card>

          {/* Fantasy settings — admin-owned */}
          <Card>
            <CardHeader title="Fantasy settings" description="Values the platform controls." />
            <CardContent className="grid grid-cols-2 gap-4">
              <Input
                label="Price (M DH)"
                name="price"
                type="number"
                step={0.1}
                min={0.1}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                hint="Transfer market value"
              />
              <Select
                label="Availability"
                name="status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e) => setStatus(e.target.value as PlayerStatus)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Stat corrections + rating */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Stat corrections"
              description="Stats sync from the feed — edit only to correct an error."
            />
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {STAT_FIELDS.map(({ key, label, hint }) => (
                  <Input
                    key={key}
                    label={label}
                    name={`stat-${key}`}
                    type="number"
                    min={0}
                    step={key === 'M' ? 1 : 0.5}
                    value={stats[key]}
                    onChange={(e) => setStatField(key, e.target.value)}
                    hint={hint}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Live rating preview" description="Recomputes as you correct stats." />
            <CardContent className="space-y-5">
              <div className="text-center">
                <p className="text-5xl font-bold tracking-tight text-primary-600">
                  {rating.scoreOutOf10.toFixed(1)}
                </p>
                <p className="mt-1 text-sm text-slate-500">out of 10</p>
              </div>
              <ProgressBar value={rating.scoreOutOf10 * 10} />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Base score</p>
                  <p className="mt-1 text-lg font-bold text-slate-800">{rating.baseScore.toFixed(2)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Final rating</p>
                  <p className="mt-1 text-lg font-bold text-slate-800">{rating.finalRating.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <Button variant="outline" onClick={() => navigate(ROUTES.playerDetail(player.id))} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={isSaving}>
          Save changes
        </Button>
      </div>
    </div>
  )
}
