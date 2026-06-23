import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/shared/Avatar'
import { DataTable, type Column } from '@/components/ui/Table'
import { Select } from '@/components/ui/Select'
import { formatNumber } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import { useGetLeaderboardQuery } from '@/services/endpoints/usersApi'
import type { SelectOption } from '@/types/common.types'
import type { User } from '@/components/users/types'

const LIMIT_OPTIONS: SelectOption<string>[] = [
  { label: 'Top 10', value: '10' },
  { label: 'Top 25', value: '25' },
  { label: 'Top 50', value: '50' },
]

const columns: Column<User>[] = [
  {
    key: 'rank',
    header: 'Rank',
    width: '64px',
    align: 'center',
    render: (u) => (
      <span
        className={
          u.rank <= 3
            ? 'text-sm font-bold text-amber-500'
            : 'text-sm font-semibold text-slate-400'
        }
      >
        #{u.rank}
      </span>
    ),
  },
  {
    key: 'name',
    header: 'Manager',
    render: (u) => (
      <div className="flex items-center gap-3">
        <Avatar name={u.name} src={u.avatarUrl} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-800">{u.name}</p>
          <p className="truncate text-xs text-slate-400">@{u.username}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'teamName',
    header: 'Team',
    render: (u) => <span className="font-medium text-slate-700">{u.teamName}</span>,
  },
  {
    key: 'country',
    header: 'Country',
    render: (u) => <span className="text-slate-500">{u.country}</span>,
  },
  {
    key: 'totalPoints',
    header: 'Points',
    align: 'right',
    render: (u) => (
      <span className="font-bold text-slate-900">{formatNumber(u.totalPoints)}</span>
    ),
  },
]

export function LeaderboardPage() {
  const navigate = useNavigate()
  const [limit, setLimit] = useState('10')

  const { data: leaderboard = [], isFetching } = useGetLeaderboardQuery({ limit: Number(limit) })

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        description="The top-ranked fantasy managers on the platform."
        actions={
          <div className="w-36">
            <Select
              options={LIMIT_OPTIONS}
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              aria-label="Show top N managers"
            />
          </div>
        }
      />

      <DataTable<User>
        columns={columns}
        data={leaderboard}
        rowKey={(u) => u.id}
        loading={isFetching}
        onRowClick={(u) => navigate(ROUTES.userDetail(u.id))}
        emptyTitle="No entries yet"
        emptyDescription="Rankings will appear once managers start scoring."
      />
    </div>
  )
}
