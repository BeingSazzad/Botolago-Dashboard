import { useNavigate, useParams } from 'react-router-dom'
import { ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/shared/Avatar'
import { PermissionGate } from '@/components/shared/PermissionGate'
import { PositionBadge, StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/Spinner'
import { ROUTES } from '@/constants/routes'
import { useToast } from '@/hooks/useToast'
import { formatDate, formatNumber } from '@/lib/utils'
import {
  useGetUserQuery,
  useGetUserTeamQuery,
  useUpdateUserStatusMutation,
} from '@/services/endpoints/usersApi'
import type { EntityStatus, Position } from '@/types/common.types'
import type { SquadPlayer } from '@/components/users/types'
import { useState } from 'react'

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
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
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
export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [banDialogOpen, setBanDialogOpen] = useState(false)

  const { data: user, isLoading } = useGetUserQuery(id ?? '', { skip: !id })
  const { data: userTeam, isFetching: teamLoading } = useGetUserTeamQuery(id ?? '', { skip: !id })
  const [updateStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation()

  const startingXI = userTeam
    ? [...userTeam.squad.filter((p) => p.isStarting)].sort(sortByPosition)
    : []
  const bench = userTeam
    ? [...userTeam.squad.filter((p) => !p.isStarting)].sort(sortByPosition)
    : []

  async function handleStatusUpdate(status: EntityStatus) {
    if (!user) return
    try {
      await updateStatus({ id: user.id, status }).unwrap()
      toast({ type: 'success', title: 'Status updated', message: `${user.name} is now ${status}.` })
    } catch {
      toast({ type: 'error', title: 'Update failed', message: 'Could not update user status.' })
    }
  }

  async function handleBanConfirm() {
    await handleStatusUpdate('banned')
    setBanDialogOpen(false)
  }

  if (!id || isLoading) {
    return <LoadingState label="Loading user…" />
  }

  if (!user) {
    return (
      <EmptyState
        title="User not found"
        description="This user doesn't exist or has been removed."
        action={
          <Button variant="outline" onClick={() => navigate(ROUTES.users)}>
            Back to users
          </Button>
        }
      />
    )
  }

  return (
    <div>
      <PageHeader
        title={user.name}
        description={`@${user.username} · ${user.email}`}
        breadcrumbs={[
          { label: 'Users', to: ROUTES.users },
          { label: user.name },
        ]}
        actions={
          <PermissionGate permission="users.manage">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
                disabled={user.status === 'active' || isUpdating}
                onClick={() => handleStatusUpdate('active')}
                loading={isUpdating}
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ShieldOff className="h-4 w-4 text-amber-500" />}
                disabled={user.status === 'suspended' || isUpdating}
                onClick={() => handleStatusUpdate('suspended')}
                loading={isUpdating}
              >
                Suspend
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<ShieldAlert className="h-4 w-4" />}
                disabled={user.status === 'banned' || isUpdating}
                onClick={() => setBanDialogOpen(true)}
              >
                Ban
              </Button>
            </div>
          </PermissionGate>
        }
      />

      {/* Profile card */}
      <Card>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar name={user.name} src={user.avatarUrl} size="lg" className="shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <StatusBadge status={user.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              <span>@{user.username}</span>
              <span>{user.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total Points</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(user.totalPoints)}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Global Rank</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">#{user.rank}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Leagues</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{user.leagues}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Country</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{user.country}</p>
        </div>
      </div>

      {/* Dates */}
      <Card className="mt-6">
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Joined</span>
            <span className="font-medium text-slate-700">{formatDate(user.joinedAt)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3">
            <span className="text-slate-500">Last active</span>
            <span className="font-medium text-slate-700">{formatDate(user.lastActiveAt, true)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Fantasy Team */}
      <Card className="mt-6">
        <CardContent>
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Fantasy Team</h3>

          {teamLoading ? (
            <LoadingState label="Loading team…" />
          ) : !userTeam ? (
            <p className="text-sm text-slate-400">This user hasn't created a team yet.</p>
          ) : (
            <div className="space-y-5">
              {/* Team header */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-slate-900">{userTeam.teamName}</span>
                <Badge variant="primary">{userTeam.formation}</Badge>
              </div>

              {/* Team stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total Points</p>
                  <p className="mt-0.5 text-xl font-bold text-slate-900">
                    {formatNumber(userTeam.points)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">GW Points</p>
                  <p className="mt-0.5 text-xl font-bold text-primary-700">{userTeam.gwPoints}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Squad Value</p>
                  <p className="mt-0.5 text-xl font-bold text-slate-900">
                    £{userTeam.squadValue.toFixed(1)}m
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">In the Bank</p>
                  <p className="mt-0.5 text-xl font-bold text-slate-900">
                    £{userTeam.budget.toFixed(1)}m
                  </p>
                </div>
              </div>

              {/* Chips used */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Chips Used</p>
                {userTeam.chipsUsed.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {userTeam.chipsUsed.map((chip) => (
                      <Badge key={chip} variant="warning">
                        {chip}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">None used</span>
                )}
              </div>

              {/* Squad sheet */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Squad</h4>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ban confirmation */}
      <ConfirmDialog
        open={banDialogOpen}
        onClose={() => setBanDialogOpen(false)}
        onConfirm={handleBanConfirm}
        title="Ban user"
        message={`Are you sure you want to ban ${user.name}? They will lose access to the platform immediately.`}
        confirmLabel="Ban user"
        destructive
        loading={isUpdating}
      />
    </div>
  )
}
