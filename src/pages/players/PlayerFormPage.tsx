import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ImageUpload } from '@/components/shared/ImageUpload'
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
import { CLUB_OPTIONS, CLUBS, PLAYER_STATUS_OPTIONS, POSITION_OPTIONS } from '@/lib/constants'
import { computeRating, EMPTY_STATS } from '@/lib/scoring'
import type { MatchStats, PlayerStatus, Position, SelectOption } from '@/types/common.types'
import type { PlayerFormValues } from '@/components/players/types'
import { useGetPlayerQuery, useUpdatePlayerMutation } from '@/services/endpoints/playersApi'

const STATUS_OPTIONS = PLAYER_STATUS_OPTIONS as SelectOption<string>[]
const POS_OPTIONS = POSITION_OPTIONS as SelectOption<string>[]
const CLB_OPTIONS = CLUB_OPTIONS as SelectOption<string>[]

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

export function PlayerFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: player, isLoading } = useGetPlayerQuery(id ?? '', { skip: !id })
  const [updatePlayer, { isLoading: isSaving }] = useUpdatePlayerMutation()

  const [form, setForm] = useState<PlayerFormValues>({
    name: '',
    club: '',
    clubShort: '',
    position: 'Forward',
    jerseyNumber: 0,
    nationality: '',
    price: 0,
    status: 'available',
    avatarUrl: undefined,
    lastStats: { ...EMPTY_STATS },
  })

  useEffect(() => {
    if (player) {
      setForm({
        name: player.name,
        club: player.club,
        clubShort: player.clubShort,
        position: player.position,
        jerseyNumber: player.jerseyNumber,
        nationality: player.nationality,
        price: player.price,
        status: player.status,
        avatarUrl: player.avatarUrl,
        lastStats: { ...player.lastStats },
      })
    }
  }, [player])

  function set<K extends keyof PlayerFormValues>(key: K, value: PlayerFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setStatField(key: keyof MatchStats, raw: string) {
    const val = parseFloat(raw)
    setForm((prev) => ({
      ...prev,
      lastStats: { ...prev.lastStats, [key]: isNaN(val) ? 0 : val },
    }))
  }

  function handleClubChange(clubName: string) {
    const found = CLUBS.find((c) => c.name === clubName)
    setForm((prev) => ({
      ...prev,
      club: clubName,
      clubShort: found?.short ?? prev.clubShort,
    }))
  }

  async function handleSave() {
    if (!id) return
    try {
      await updatePlayer({ id, changes: form }).unwrap()
      toast({ variant: 'success', title: 'Player updated', description: `${form.name} has been updated.` })
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

  const rating = computeRating(form.position, form.lastStats)

  return (
    <div>
      <PageHeader
        title="Manage player"
        description="Player data syncs from the data feed — your edits here override it."
        breadcrumbs={[
          { label: 'Players', to: ROUTES.players },
          { label: player.name, to: ROUTES.playerDetail(player.id) },
          { label: 'Manage' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Player identity — now fully editable */}
          <Card>
            <CardHeader
              title="Player details"
              description="Edit any field to override the synced feed value."
              action={
                <Badge variant="neutral" dot>
                  Synced — editing overrides the feed
                </Badge>
              }
            />
            <CardContent className="space-y-5">
              <ImageUpload
                variant="circle"
                value={form.avatarUrl ?? null}
                onChange={(v) => set('avatarUrl', v ?? undefined)}
                label="Player photo"
                hint="PNG/JPG, under 512 KB"
              />

              <Input
                label="Full name"
                name="name"
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />

              <Select
                label="Club"
                name="club"
                options={CLB_OPTIONS}
                value={form.club}
                onChange={(e) => handleClubChange(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Position"
                  name="position"
                  options={POS_OPTIONS}
                  value={form.position}
                  onChange={(e) => set('position', e.target.value as Position)}
                />
                <Input
                  label="Jersey number"
                  name="jerseyNumber"
                  type="number"
                  min={1}
                  max={99}
                  step={1}
                  value={form.jerseyNumber}
                  onChange={(e) => set('jerseyNumber', parseInt(e.target.value) || 0)}
                />
              </div>

              <Input
                label="Nationality"
                name="nationality"
                type="text"
                value={form.nationality}
                onChange={(e) => set('nationality', e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Fantasy settings */}
          <Card>
            <CardHeader title="Fantasy settings" description="Values the platform controls." />
            <CardContent className="grid grid-cols-2 gap-4">
              <Input
                label="Price (M DH)"
                name="price"
                type="number"
                step={0.1}
                min={0.1}
                value={form.price}
                onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                hint="Transfer market value"
              />
              <Select
                label="Availability"
                name="status"
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(e) => set('status', e.target.value as PlayerStatus)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Match stats + live rating preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Match stats"
              description="Stats sync from the feed — edit to override or correct."
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
                    value={form.lastStats[key]}
                    onChange={(e) => setStatField(key, e.target.value)}
                    hint={hint}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Live rating preview" description="Recomputes as you edit stats or position." />
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
