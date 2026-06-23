import type { FantasyTeam, FantasyTeamDetail, User } from '@/components/users/types'
import { api } from '@/services/api'
import {
  getTeamDetail,
  getTeamDetailByOwner,
  teams as teamSeed,
  users as userSeed,
} from '@/services/mock/data'
import { mockResult, paginate } from '@/services/mock/helpers'
import type { ListResponse } from '@/types/api.types'
import type { EntityStatus, ID, QueryParams } from '@/types/common.types'

let store: User[] = [...userSeed]

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<ListResponse<User>, QueryParams | void>({
      queryFn: (params) =>
        mockResult(paginate(store, params ?? {}, ['name', 'email', 'username', 'teamName'])),
      providesTags: (res) =>
        res
          ? [...res.items.map((u) => ({ type: 'User' as const, id: u.id })), { type: 'User', id: 'LIST' }]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getUser: build.query<User, ID>({
      queryFn: (id) => {
        const user = store.find((u) => u.id === id)
        return user ? mockResult(user) : { error: { status: 404, message: 'User not found' } }
      },
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    updateUserStatus: build.mutation<User, { id: ID; status: EntityStatus }>({
      queryFn: ({ id, status }) => {
        const idx = store.findIndex((u) => u.id === id)
        if (idx === -1) return { error: { status: 404, message: 'User not found' } }
        store[idx] = { ...store[idx], status }
        return mockResult(store[idx])
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    getLeaderboard: build.query<User[], { limit?: number } | void>({
      queryFn: (args) => {
        const limit = args?.limit ?? 10
        const top = [...store].sort((a, b) => a.rank - b.rank).slice(0, limit)
        return mockResult(top)
      },
      providesTags: [{ type: 'User', id: 'LEADERBOARD' }],
    }),

    getTeams: build.query<ListResponse<FantasyTeam>, QueryParams | void>({
      queryFn: (params) => mockResult(paginate(teamSeed, params ?? {}, ['teamName', 'ownerName'])),
      providesTags: [{ type: 'Team', id: 'LIST' }],
    }),

    getTeam: build.query<FantasyTeamDetail, ID>({
      queryFn: (id) => {
        const detail = getTeamDetail(id)
        return detail ? mockResult(detail) : { error: { status: 404, message: 'Team not found' } }
      },
      providesTags: (_r, _e, id) => [{ type: 'Team', id }],
    }),

    getUserTeam: build.query<FantasyTeamDetail, ID>({
      queryFn: (ownerId) => {
        const detail = getTeamDetailByOwner(ownerId)
        return detail ? mockResult(detail) : { error: { status: 404, message: 'No team for user' } }
      },
      providesTags: (res) => (res ? [{ type: 'Team', id: res.id }] : []),
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserStatusMutation,
  useGetLeaderboardQuery,
  useGetTeamsQuery,
  useGetTeamQuery,
  useGetUserTeamQuery,
} = usersApi
