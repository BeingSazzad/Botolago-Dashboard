import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/ui/Spinner'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/constants/routes'
import { POSITION_OPTIONS, CLUB_OPTIONS, CLUBS } from '@/lib/constants'
import { computeRating, EMPTY_STATS } from '@/lib/scoring'
import type { MatchStats, EntityStatus, Position, SelectOption } from '@/types/common.types'
import type { PlayerFormValues } from '@/components/players/types'
import {
  useGetPlayerQuery,
  useCreatePlayerMutation,
  useUpdatePlayerMutation,
} from '@/services/endpoints/playersApi'

const STATUS_OPTIONS: SelectOption<string>[] = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Banned', value: 'banned' },
  { label: 'Pending', value: 'pending' },
]

interface StatFieldConfig {
  key: keyof MatchStats
  label: string
  hint?: string
}

const STAT_FIELDS: StatFieldConfig[] = [
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

const DEFAULT_FORM: PlayerFormValues = {
  name: '',
  club: 'Arsenal',
  clubShort: 'ARS',
  position: 'Forward',
  jerseyNumber: 1,
  nationality: '',
  price: 5.0,
  status: 'active',
  avatarUrl: undefined,
  lastStats: { ...EMPTY_STATS },
}

export function PlayerFormPage() {
  const { id } = useParams<{ id: string }>()
  const editMode = !!id
  const navigate = useNavigate()
  const toast = useToast()

  const { data: existingPlayer, isLoading: isLoadingPlayer } = useGetPlayerQuery(id ?? '', {
    skip: !editMode,
  })

  const [createPlayer, { isLoading: isCreating }] = useCreatePlayerMutation()
  const [updatePlayer, { isLoading: isUpdating }] = useUpdatePlayerMutation()

  const isSaving = isCreating || isUpdating

  const [form, setForm] = useState<PlayerFormValues>(DEFAULT_FORM)

  // Prefill form when editing an existing player
  useEffect(() => {
    if (editMode && existingPlayer) {
      setForm({
        name: existingPlayer.name,
        club: existingPlayer.club,
        clubShort: existingPlayer.clubShort,
        position: existingPlayer.position,
        jerseyNumber: existingPlayer.jerseyNumber,
        nationality: existingPlayer.nationality,
        price: existingPlayer.price,
        status: existingPlayer.status,
        avatarUrl: existingPlayer.avatarUrl,
        lastStats: { ...existingPlayer.lastStats },
      })
    }
  }, [editMode, existingPlayer])

  function setField<K extends keyof PlayerFormValues>(key: K, value: PlayerFormValues[K]) {
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
      clubShort: found?.short ?? clubName.slice(0, 3).toUpperCase(),
    }))
  }

  async function handleSave() {
    try {
      if (editMode && id) {
        await updatePlayer({ id, changes: form }).unwrap()
        toast({
          variant: 'success',
          title: 'Player updated',
          description: `${form.name} has been updated successfully.`,
        })
      } else {
        await createPlayer(form).unwrap()
        toast({
          variant: 'success',
          title: 'Player created',
          description: `${form.name} has been added to the squad.`,
        })
      }
      navigate(ROUTES.players)
    } catch {
      toast({
        variant: 'error',
        title: editMode ? 'Update failed' : 'Create failed',
        description: 'An error occurred. Please try again.',
      })
    }
  }

  const rating = computeRating(form.position, form.lastStats)

  if (editMode && isLoadingPlayer) {
    return <LoadingState label="Loading player…" />
  }

  return (
    <div>
      <PageHeader
        title={editMode ? 'Edit player' : 'New player'}
        description={
          editMode
            ? 'Update the player details and match stats below.'
            : 'Fill in the details to add a new player to the database.'
        }
        breadcrumbs={[
          { label: 'Players', to: ROUTES.players },
          { label: editMode ? 'Edit player' : 'New player' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Player details */}
        <Card>
          <CardHeader
            title="Player details"
            description="Basic identity and contract information."
          />
          <CardContent className="space-y-4">
            <Input
              label="Full name"
              name="name"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. Erling Haaland"
            />

            <Select
              label="Club"
              name="club"
              options={CLUB_OPTIONS}
              value={form.club}
              onChange={(e) => handleClubChange(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Position"
                name="position"
                options={POSITION_OPTIONS as SelectOption<string>[]}
                value={form.position}
                onChange={(e) => setField('position', e.target.value as Position)}
              />
              <Input
                label="Jersey number"
                name="jerseyNumber"
                type="number"
                min={1}
                max={99}
                value={form.jerseyNumber}
                onChange={(e) =>
                  setField('jerseyNumber', parseInt(e.target.value, 10) || 1)
                }
              />
            </div>

            <Input
              label="Nationality"
              name="nationality"
              value={form.nationality}
              onChange={(e) => setField('nationality', e.target.value)}
              placeholder="e.g. Norwegian"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (£m)"
                name="price"
                type="number"
                step={0.1}
                min={0.1}
                value={form.price}
                onChange={(e) =>
                  setField('price', parseFloat(e.target.value) || 0)
                }
                hint="Transfer market value in millions"
              />

              <Select
                label="Status"
                name="status"
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(e) => setField('status', e.target.value as EntityStatus)}
              />
            </div>

            <Input
              label="Avatar URL"
              name="avatarUrl"
              type="url"
              value={form.avatarUrl ?? ''}
              onChange={(e) =>
                setField('avatarUrl', e.target.value || undefined)
              }
              placeholder="https://… (optional)"
            />
          </CardContent>
        </Card>

        {/* Right: Stats + Rating preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Latest match stats"
              description="Stats from the player's most recent appearance."
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

          {/* Live rating preview */}
          <Card>
            <CardHeader
              title="Live rating preview"
              description="Updates as you change position or stats."
            />
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
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Base score
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {rating.baseScore.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Final rating
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {rating.finalRating.toFixed(2)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Position: <span className="font-medium text-slate-600">{form.position}</span>
                {' · '}
                Normalised to 30-point scale
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.players)}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} loading={isSaving}>
          {editMode ? 'Save changes' : 'Create player'}
        </Button>
      </div>
    </div>
  )
}
