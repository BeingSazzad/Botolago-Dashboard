import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BarChart2,
  MousePointerClick,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/ui/Spinner'
import { useGetDashboardQuery } from '@/services/endpoints/dashboardApi'
import { formatCompact, formatNumber } from '@/lib/utils'

// ─── Colour palette shared across all charts ────────────────────────────────
const COLORS = ['#1d4ed8', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6']

// ─── Axis / grid / tooltip style constants matching DashboardPage exactly ───
const AXIS_STYLE = { stroke: '#94a3b8', fontSize: 12, tickLine: false, axisLine: false } as const
const GRID_STYLE = { strokeDasharray: '3 3', stroke: '#eef2f7', vertical: false } as const
const TOOLTIP_STYLE = {
  contentStyle: { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 },
} as const

// ─── Static inline data (derived / mock analytics) ───────────────────────────

const DAILY_ACTIVE: { day: string; dau: number; sessions: number }[] = [
  { day: 'Mon', dau: 3_820, sessions: 6_210 },
  { day: 'Tue', dau: 4_110, sessions: 6_780 },
  { day: 'Wed', dau: 3_950, sessions: 6_450 },
  { day: 'Thu', dau: 4_400, sessions: 7_100 },
  { day: 'Fri', dau: 5_080, sessions: 8_340 },
  { day: 'Sat', dau: 6_220, sessions: 9_880 },
  { day: 'Sun', dau: 6_550, sessions: 10_420 },
  { day: 'Mon', dau: 4_300, sessions: 7_010 },
  { day: 'Tue', dau: 4_560, sessions: 7_480 },
  { day: 'Wed', dau: 4_750, sessions: 7_760 },
  { day: 'Thu', dau: 4_920, sessions: 8_030 },
  { day: 'Fri', dau: 5_610, sessions: 9_040 },
  { day: 'Sat', dau: 6_880, sessions: 11_200 },
  { day: 'Sun', dau: 7_140, sessions: 11_750 },
]

const PLATFORM_SPLIT: { name: string; value: number }[] = [
  { name: 'iOS', value: 38 },
  { name: 'Android', value: 34 },
  { name: 'Web', value: 21 },
  { name: 'PWA', value: 7 },
]

const FUNNEL: { stage: string; count: number }[] = [
  { stage: 'Visitors', count: 120_000 },
  { stage: 'Sign-ups', count: 48_200 },
  { stage: 'Created team', count: 31_400 },
  { stage: 'Active managers', count: 22_600 },
  { stage: 'Paying', count: 9_840 },
]

const REVENUE_TREND: { month: string; revenue: number; subs: number }[] = [
  { month: 'Jan', revenue: 18_400, subs: 3_200 },
  { month: 'Feb', revenue: 21_100, subs: 3_680 },
  { month: 'Mar', revenue: 24_500, subs: 4_250 },
  { month: 'Apr', revenue: 27_200, subs: 4_710 },
  { month: 'May', revenue: 31_800, subs: 5_500 },
  { month: 'Jun', revenue: 35_600, subs: 6_120 },
]

const TIME_RANGE_OPTIONS = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Season', value: 'season' },
]

const ANALYTICS_TABS = [
  { value: 'engagement', label: 'Engagement', icon: <Zap className="h-3.5 w-3.5" /> },
  { value: 'monetisation', label: 'Monetisation', icon: <Wallet className="h-3.5 w-3.5" /> },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const { data, isLoading } = useGetDashboardQuery()
  const [timeRange, setTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('engagement')

  if (isLoading || !data) return <LoadingState label="Loading analytics…" />

  const { stats, signupTrend, positionBreakdown, pointsDistribution } = data

  // Derived KPIs from real data
  const dauPeak = Math.max(...DAILY_ACTIVE.map((d) => d.dau))
  const retentionRate = Math.round((stats.activeTeams / stats.totalUsers) * 100)
  const conversionRate = Math.round((FUNNEL[4].count / FUNNEL[0].count) * 100 * 10) / 10
  const avgSessionMin = 8.4

  // Funnel helper
  const funnelTop = FUNNEL[0].count

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Engagement, growth and monetisation insights."
        actions={
          <div className="w-44">
            <Select
              name="timeRange"
              value={timeRange}
              options={TIME_RANGE_OPTIONS}
              onChange={(e) => setTimeRange(e.target.value)}
            />
          </div>
        }
      />

      {/* ── KPI stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Peak DAU"
          value={formatCompact(dauPeak)}
          delta={11.2}
          hint="vs prior period"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Avg Session"
          value={`${avgSessionMin} min`}
          delta={4.7}
          hint="per user"
          icon={<MousePointerClick className="h-5 w-5" />}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Retention Rate"
          value={`${retentionRate}%`}
          delta={-1.4}
          hint="28-day rolling"
          icon={<RefreshCw className="h-5 w-5" />}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          delta={0.8}
          hint="visitor → paying"
          icon={<TrendingUp className="h-5 w-5" />}
          iconClassName="bg-violet-50 text-violet-600"
        />
      </div>

      {/* ── User growth: full-width area chart ──────────────────────────── */}
      <Card className="mt-6">
        <CardHeader
          title="User growth"
          description="New registrations vs active users — 6-month view"
          action={
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#1d4ed8]" />
                Total sign-ups
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#10b981]" />
                Active users
              </span>
            </div>
          }
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={signupTrend} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="agUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="agActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="label" {...AXIS_STYLE} />
              <YAxis {...AXIS_STYLE} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                formatter={(value) => (value === 'users' ? 'Total sign-ups' : 'Active users')}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#1d4ed8"
                strokeWidth={2}
                fill="url(#agUsers)"
                name="users"
              />
              <Area
                type="monotone"
                dataKey="active"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#agActive)"
                name="active"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Tab section ─────────────────────────────────────────────────── */}
      <div className="mt-6">
        <Tabs tabs={ANALYTICS_TABS} value={activeTab} onChange={setActiveTab} />

        {/* ENGAGEMENT TAB */}
        {activeTab === 'engagement' && (
          <>
            {/* DAU + Platform split */}
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* DAU LineChart */}
              <Card className="lg:col-span-2">
                <CardHeader
                  title="Daily active users"
                  description="DAU and sessions over the last 14 days"
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={DAILY_ACTIVE} margin={{ left: -20, right: 8, top: 8 }}>
                      <CartesianGrid {...GRID_STYLE} />
                      <XAxis dataKey="day" {...AXIS_STYLE} />
                      <YAxis {...AXIS_STYLE} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="dau"
                        stroke="#1d4ed8"
                        strokeWidth={2}
                        dot={false}
                        name="DAU"
                      />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={false}
                        name="Sessions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Platform split PieChart */}
              <Card>
                <CardHeader title="Platform split" description="Users by device/platform" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={PLATFORM_SPLIT}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {PLATFORM_SPLIT.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        {...TOOLTIP_STYLE}
                        formatter={(v: number) => [`${v}%`, 'Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {PLATFORM_SPLIT.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-2 text-sm">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-slate-500">{p.name}</span>
                        <span className="ml-auto font-medium text-slate-700">{p.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Points distribution */}
            <Card className="mt-6">
              <CardHeader
                title="Points distribution"
                description="How managers are spread across score bands"
                action={
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <BarChart2 className="h-4 w-4" />
                    {formatNumber(stats.totalUsers)} managers
                  </div>
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={pointsDistribution} margin={{ left: -20, right: 8, top: 8 }}>
                    <CartesianGrid {...GRID_STYLE} />
                    <XAxis dataKey="range" {...AXIS_STYLE} />
                    <YAxis {...AXIS_STYLE} />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      {...TOOLTIP_STYLE}
                    />
                    <Bar dataKey="users" fill="#1d4ed8" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion funnel */}
            <Card className="mt-6">
              <CardHeader
                title="Conversion funnel"
                description="Visitor → paying manager pipeline"
              />
              <CardContent>
                <div className="space-y-4">
                  {FUNNEL.map((stage, i) => {
                    const pct = Math.round((stage.count / funnelTop) * 100)
                    return (
                      <div key={stage.stage} className="flex items-center gap-4">
                        <div className="w-36 shrink-0">
                          <p className="text-sm font-medium text-slate-700">{stage.stage}</p>
                          <p className="text-xs text-slate-400">{formatNumber(stage.count)}</p>
                        </div>
                        <div className="flex-1">
                          <ProgressBar
                            value={pct}
                            barClassName={
                              [
                                'bg-[#1d4ed8]',
                                'bg-[#0ea5e9]',
                                'bg-[#10b981]',
                                'bg-[#f59e0b]',
                                'bg-[#8b5cf6]',
                              ][i]
                            }
                          />
                        </div>
                        <div className="w-12 text-right text-sm font-semibold text-slate-700">
                          {pct}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* MONETISATION TAB */}
        {activeTab === 'monetisation' && (
          <>
            {/* Revenue trend AreaChart */}
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader
                  title="Revenue trend"
                  description="Monthly gross revenue (USD)"
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={REVENUE_TREND} margin={{ left: -20, right: 8, top: 8 }}>
                      <defs>
                        <linearGradient id="agRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid {...GRID_STYLE} />
                      <XAxis dataKey="month" {...AXIS_STYLE} />
                      <YAxis
                        {...AXIS_STYLE}
                        tickFormatter={(v: number) => `$${formatCompact(v)}`}
                      />
                      <Tooltip
                        {...TOOLTIP_STYLE}
                        formatter={(v: number) => [`$${formatNumber(v)}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#agRevenue)"
                        name="Revenue"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Paid subscribers BarChart */}
              <Card>
                <CardHeader
                  title="Paid subscribers"
                  description="Monthly subscription count"
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={REVENUE_TREND} margin={{ left: -20, right: 8, top: 8 }}>
                      <CartesianGrid {...GRID_STYLE} />
                      <XAxis dataKey="month" {...AXIS_STYLE} />
                      <YAxis {...AXIS_STYLE} />
                      <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        {...TOOLTIP_STYLE}
                        formatter={(v: number) => [formatNumber(v), 'Subscribers']}
                      />
                      <Bar dataKey="subs" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} name="Subs" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Squad position breakdown */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader
                  title="Squad composition"
                  description="Preferred positions by active managers"
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={positionBreakdown}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {positionBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {positionBreakdown.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-2 text-sm">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-slate-500">{p.name}</span>
                        <span className="ml-auto font-medium text-slate-700">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue KPIs summary */}
              <Card>
                <CardHeader
                  title="Monetisation snapshot"
                  description={`Revenue stats · ${formatCompact(stats.revenue)} MTD`}
                />
                <CardContent className="space-y-5">
                  {[
                    {
                      label: 'MRR',
                      value: `$${formatCompact(stats.revenue)}`,
                      sub: `${stats.revenueDelta > 0 ? '+' : ''}${stats.revenueDelta}% vs last month`,
                      pct: Math.min(100, Math.abs(stats.revenueDelta) * 3),
                      color: 'bg-[#1d4ed8]',
                    },
                    {
                      label: 'ARPU',
                      value: `$${(stats.revenue / stats.totalUsers).toFixed(2)}`,
                      sub: 'per registered user',
                      pct: 62,
                      color: 'bg-[#10b981]',
                    },
                    {
                      label: 'Paying users',
                      value: formatNumber(FUNNEL[4].count),
                      sub: `${conversionRate}% of total sign-ups`,
                      pct: conversionRate * 10,
                      color: 'bg-[#8b5cf6]',
                    },
                    {
                      label: 'Avg subscription value',
                      value: `$${(stats.revenue / FUNNEL[4].count).toFixed(2)}`,
                      sub: 'per paying user',
                      pct: 74,
                      color: 'bg-[#f59e0b]',
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                      </div>
                      <ProgressBar value={item.pct} barClassName={item.color} />
                      <p className="mt-1 text-xs text-slate-400">{item.sub}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
