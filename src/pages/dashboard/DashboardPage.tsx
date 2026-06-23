import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Plug,
  RefreshCw,
  Stethoscope,
  TrendingUp,
  Trophy,
  Users,
  Volleyball,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Avatar } from '@/components/shared/Avatar'
import { PositionBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { useGetDashboardQuery, useGetFootballFeedQuery } from '@/services/endpoints/dashboardApi'
import { useGetLeaderboardQuery } from '@/services/endpoints/usersApi'
import { useToast } from '@/hooks/useToast'
import { cn, formatCompact, formatDate, formatNumber } from '@/lib/utils'
import type {
  AvailabilityRow,
  MatchdayFixture,
  MoverRow,
  PerformerRow,
  StandingRow,
} from '@/services/mock/data'

const POSITION_COLORS = ['#1d4ed8', '#f59e0b', '#0ea5e9', '#10b981']

function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4 mt-8 flex items-center gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{children}</h2>
      {hint && <span className="text-xs text-slate-400">· {hint}</span>}
    </div>
  )
}

function ClubTag({ short }: { short: string }) {
  return (
    <span className="flex h-6 w-9 shrink-0 items-center justify-center rounded bg-slate-100 text-[11px] font-bold text-slate-600">
      {short}
    </span>
  )
}

/* ---- Live data-feed status bar ---- */
function FeedMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function kickoffTime(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/* ---- Matchday scoreboard row ---- */
function MatchRow({ m }: { m: MatchdayFixture }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      {/* Home — flush left */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <ClubTag short={m.homeShort} />
        <span className="truncate text-sm font-semibold text-slate-800">{m.homeClub}</span>
      </div>

      {/* Score / kickoff — fixed centre column */}
      <div className="flex w-16 shrink-0 flex-col items-center">
        {m.status === 'upcoming' ? (
          <span className="text-xs font-semibold text-slate-400">{kickoffTime(m.kickoff)}</span>
        ) : (
          <span className="font-mono text-base font-bold text-slate-900">
            {m.homeScore}–{m.awayScore}
          </span>
        )}
        {m.status === 'live' && (
          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold uppercase text-rose-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
            {m.minute}&apos;
          </span>
        )}
        {m.status === 'finished' && (
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">FT</span>
        )}
        {m.status === 'upcoming' && (
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-300">Today</span>
        )}
      </div>

      {/* Away — flush right */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
        <span className="truncate text-sm font-semibold text-slate-800">{m.awayClub}</span>
        <ClubTag short={m.awayShort} />
      </div>
    </div>
  )
}

/* ---- Top performers row ---- */
function PerformerCard({ rows }: { rows: PerformerRow[] }) {
  return (
    <CardContent className="space-y-3">
      {rows.map((p, i) => (
        <div key={p.id} className="flex items-center gap-3">
          <span className="w-4 text-sm font-bold text-slate-300">{i + 1}</span>
          <Avatar name={p.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">{p.name}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <PositionBadge position={p.position} />
              <span className="text-xs text-slate-400">
                {p.clubShort} · {p.goals}G {p.assists}A
              </span>
            </div>
          </div>
          <span className="text-lg font-bold text-primary-700">{p.points}</span>
        </div>
      ))}
    </CardContent>
  )
}

/* ---- Availability / injuries ---- */
const AVAIL_META: Record<AvailabilityRow['status'], { label: string; variant: BadgeVariant }> = {
  injured: { label: 'Injured', variant: 'danger' },
  suspended: { label: 'Suspended', variant: 'warning' },
  doubtful: { label: 'Doubtful', variant: 'info' },
}

function AvailabilityCard({ rows }: { rows: AvailabilityRow[] }) {
  return (
    <CardContent className="space-y-3.5">
      {rows.map((a) => (
        <div key={a.id} className="flex items-start gap-3">
          <Avatar name={a.name} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-slate-800">
                {a.name} <span className="text-xs font-normal text-slate-400">{a.clubShort}</span>
              </p>
              <Badge variant={AVAIL_META[a.status].variant}>{AVAIL_META[a.status].label}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{a.news}</p>
            {a.status === 'doubtful' && (
              <div className="mt-1.5 flex items-center gap-2">
                <ProgressBar value={a.chance} className="h-1.5 max-w-[120px]" />
                <span className="text-[10px] font-medium text-slate-400">{a.chance}% chance</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </CardContent>
  )
}

/* ---- Transfer market movers ---- */
function MoversCard({ rows }: { rows: MoverRow[] }) {
  return (
    <CardContent className="space-y-2.5">
      {rows.map((m) => {
        const up = m.direction === 'up'
        return (
          <div key={m.id} className="flex items-center gap-3">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
              )}
            >
              {up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {m.name} <span className="text-xs font-normal text-slate-400">{m.clubShort}</span>
              </p>
              <p className="text-xs text-slate-400">
                {m.netTransfers > 0 ? '+' : ''}
                {formatCompact(m.netTransfers)} net transfers
              </p>
            </div>
            <span className={cn('text-sm font-semibold', up ? 'text-emerald-600' : 'text-rose-600')}>
              {up ? '+' : '−'}DH {Math.abs(m.priceChange).toFixed(1)}M
            </span>
          </div>
        )
      })}
    </CardContent>
  )
}

/* ---- League standings ---- */
function StandingsCard({ rows }: { rows: StandingRow[] }) {
  return (
    <CardContent className="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="py-2 pl-5 text-left font-semibold">#</th>
            <th className="text-left font-semibold">Club</th>
            <th className="text-center font-semibold">P</th>
            <th className="text-center font-semibold">GD</th>
            <th className="py-2 pr-5 text-right font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((s) => (
            <tr key={s.short}>
              <td className="py-2.5 pl-5 font-semibold text-slate-400">{s.pos}</td>
              <td>
                <div className="flex items-center gap-2">
                  <ClubTag short={s.short} />
                  <span className="font-medium text-slate-700">{s.club}</span>
                </div>
              </td>
              <td className="text-center text-slate-500">{s.played}</td>
              <td className="text-center text-slate-500">
                {s.gd > 0 ? '+' : ''}
                {s.gd}
              </td>
              <td className="py-2.5 pr-5 text-right font-bold text-slate-900">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent>
  )
}

export function DashboardPage() {
  const toast = useToast()
  const { data, isLoading } = useGetDashboardQuery()
  const { data: feed, isLoading: feedLoading, refetch } = useGetFootballFeedQuery()
  const { data: leaders } = useGetLeaderboardQuery({ limit: 5 })
  const [syncing, setSyncing] = useState(false)

  if (isLoading || !data || feedLoading || !feed) return <LoadingState label="Loading dashboard…" />

  const { stats, signupTrend, positionBreakdown, recentActivity } = data
  const { dataFeed, matchday, topPerformers, availability, priceMovers, standings } = feed
  const liveCount = matchday.filter((m) => m.status === 'live').length

  async function handleSync() {
    setSyncing(true)
    try {
      await refetch()
      toast({ variant: 'success', title: 'Feed synced', description: `Latest data pulled from ${dataFeed.provider}.` })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your fantasy football platform."
        actions={
          <Link to={ROUTES.analytics}>
            <Button variant="outline" leftIcon={<TrendingUp className="h-4 w-4" />}>
              View analytics
            </Button>
          </Link>
        }
      />

      {/* Live data-feed status bar */}
      <Card className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Plug className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </span>
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              Data feed connected
              <Badge variant="neutral">{dataFeed.provider}</Badge>
            </p>
            <p className="text-xs text-slate-500">
              Gameweek {dataFeed.currentGameweek} · auto-sync {dataFeed.autoSync ? 'on' : 'off'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          <FeedMetric label="Last sync" value={`${dataFeed.lastSyncMinutes}m ago`} />
          <FeedMetric label="Records today" value={formatCompact(dataFeed.recordsToday)} />
          <FeedMetric label="Latency" value={`${dataFeed.latencyMs}ms`} />
          <FeedMetric label="Uptime" value={`${dataFeed.uptimePct}%`} />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />}
            onClick={handleSync}
            loading={syncing}
          >
            Sync now
          </Button>
        </div>
      </Card>

      {/* KPI tiles */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={formatNumber(stats.totalUsers)}
          delta={stats.usersDelta}
          hint="vs last month"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Active Teams"
          value={formatNumber(stats.activeTeams)}
          delta={stats.teamsDelta}
          hint="vs last month"
          icon={<Trophy className="h-5 w-5" />}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Registered Players"
          value={formatNumber(stats.totalPlayers)}
          delta={stats.playersDelta}
          hint="in database"
          icon={<Volleyball className="h-5 w-5" />}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Revenue (MTD)"
          value={`DH ${formatCompact(stats.revenue)}`}
          delta={stats.revenueDelta}
          hint="vs last month"
          icon={<Activity className="h-5 w-5" />}
          iconClassName="bg-violet-50 text-violet-600"
        />
      </div>

      {/* ───────── Matchday — live from the data feed ───────── */}
      <SectionTitle hint="sourced from the live sports data feed">Matchday</SectionTitle>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Live & upcoming fixtures"
            description="Scores update automatically from the feed"
            action={
              liveCount > 0 ? (
                <Badge variant="danger" dot>
                  {liveCount} live
                </Badge>
              ) : (
                <Badge variant="neutral">No live games</Badge>
              )
            }
          />
          <CardContent className="divide-y divide-slate-100 p-0">
            {matchday.map((m) => (
              <MatchRow key={m.id} m={m} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Top performers" description={`Gameweek ${dataFeed.currentGameweek}`} />
          <PerformerCard rows={topPerformers} />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader
            title="Availability & injuries"
            action={
              <span className="flex items-center gap-1.5 text-slate-400">
                <Stethoscope className="h-4 w-4" />
              </span>
            }
          />
          <AvailabilityCard rows={availability} />
        </Card>

        <Card>
          <CardHeader title="Transfer market" description="Biggest price & ownership movers" />
          <MoversCard rows={priceMovers} />
        </Card>

        <Card>
          <CardHeader title="League table" description="Top of the standings" />
          <StandingsCard rows={standings} />
        </Card>
      </div>

      {/* ───────── Audience & growth ───────── */}
      <SectionTitle hint="platform analytics">Audience &amp; growth</SectionTitle>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="User growth" description="New vs active users over the last 6 months" />
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={signupTrend} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Area type="monotone" dataKey="users" stroke="#1d4ed8" strokeWidth={2} fill="url(#gUsers)" />
                <Area type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} fill="url(#gActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Squad composition" description="Players by position" />
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={positionBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {positionBreakdown.map((_, i) => (
                    <Cell key={i} fill={POSITION_COLORS[i % POSITION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {positionBreakdown.map((p, i) => (
                <div key={p.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: POSITION_COLORS[i % POSITION_COLORS.length] }} />
                  <span className="text-slate-500">{p.name}</span>
                  <span className="ml-auto font-medium text-slate-700">{p.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent activity" action={<Badge variant="success" dot>Live</Badge>} />
          <CardContent className="divide-y divide-slate-100 p-0">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <p className="flex-1 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{a.actor}</span> {a.action}{' '}
                  <span className="font-medium text-slate-800">{a.target}</span>
                </p>
                <span className="text-xs text-slate-400">{formatDate(a.at, true)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Top managers"
            action={
              <Link to={ROUTES.leaderboard} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View all
              </Link>
            }
          />
          <CardContent className="space-y-3">
            {leaders?.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className="w-5 text-sm font-bold text-slate-400">{i + 1}</span>
                <Avatar name={u.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{u.teamName}</p>
                  <p className="truncate text-xs text-slate-400">{u.name}</p>
                </div>
                <Badge variant="primary">{formatNumber(u.totalPoints)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
