import { api } from '@/services/api'
import {
  availability,
  dashboardStats,
  dataFeed,
  matchday,
  pointsDistribution,
  positionBreakdown,
  priceMovers,
  recentActivity,
  signupTrend,
  standings,
  topPerformers,
  type AvailabilityRow,
  type MatchdayFixture,
  type MoverRow,
  type PerformerRow,
  type StandingRow,
} from '@/services/mock/data'
import { mockResult } from '@/services/mock/helpers'

export interface DashboardOverview {
  stats: typeof dashboardStats
  signupTrend: typeof signupTrend
  positionBreakdown: typeof positionBreakdown
  pointsDistribution: typeof pointsDistribution
  recentActivity: typeof recentActivity
}

/** Everything sourced from the external sports data feed. */
export interface FootballFeed {
  dataFeed: typeof dataFeed
  matchday: MatchdayFixture[]
  topPerformers: PerformerRow[]
  availability: AvailabilityRow[]
  priceMovers: MoverRow[]
  standings: StandingRow[]
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<DashboardOverview, void>({
      queryFn: () =>
        mockResult({
          stats: dashboardStats,
          signupTrend,
          positionBreakdown,
          pointsDistribution,
          recentActivity,
        }),
      providesTags: [{ type: 'Dashboard', id: 'OVERVIEW' }],
    }),

    getFootballFeed: build.query<FootballFeed, void>({
      queryFn: () =>
        mockResult({
          dataFeed,
          matchday,
          topPerformers,
          availability,
          priceMovers,
          standings,
        }),
      providesTags: [{ type: 'Dashboard', id: 'FEED' }],
    }),
  }),
})

export const { useGetDashboardQuery, useGetFootballFeedQuery } = dashboardApi
