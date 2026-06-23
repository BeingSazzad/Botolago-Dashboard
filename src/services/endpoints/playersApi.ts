import type { Player, PlayerFormValues } from '@/components/players/types'
import { computeRating } from '@/lib/scoring'
import { api } from '@/services/api'
import { players as seed } from '@/services/mock/data'
import { mockResult, nextId, paginate } from '@/services/mock/helpers'
import type { ListResponse } from '@/types/api.types'
import type { ID, QueryParams } from '@/types/common.types'

// Mutable in-session store.
let store: Player[] = [...seed]

export const playersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPlayers: build.query<ListResponse<Player>, QueryParams | void>({
      queryFn: (params) =>
        mockResult(paginate(store, params ?? {}, ['name', 'club', 'nationality'])),
      providesTags: (res) =>
        res
          ? [...res.items.map((p) => ({ type: 'Player' as const, id: p.id })), { type: 'Player', id: 'LIST' }]
          : [{ type: 'Player', id: 'LIST' }],
    }),

    getPlayer: build.query<Player, ID>({
      queryFn: (id) => {
        const player = store.find((p) => p.id === id)
        return player ? mockResult(player) : { error: { status: 404, message: 'Player not found' } }
      },
      providesTags: (_r, _e, id) => [{ type: 'Player', id }],
    }),

    createPlayer: build.mutation<Player, PlayerFormValues>({
      queryFn: (values) => {
        const { scoreOutOf10 } = computeRating(values.position, values.lastStats)
        const player: Player = {
          ...values,
          id: nextId('pl'),
          totalPoints: 0,
          rating: scoreOutOf10,
          ownership: 0,
          createdAt: new Date().toISOString(),
        }
        store = [player, ...store]
        return mockResult(player)
      },
      invalidatesTags: [{ type: 'Player', id: 'LIST' }],
    }),

    updatePlayer: build.mutation<Player, { id: ID; changes: Partial<PlayerFormValues> }>({
      queryFn: ({ id, changes }) => {
        const idx = store.findIndex((p) => p.id === id)
        if (idx === -1) return { error: { status: 404, message: 'Player not found' } }
        const merged = { ...store[idx], ...changes }
        // Recompute rating whenever position or stats change.
        merged.rating = computeRating(merged.position, merged.lastStats).scoreOutOf10
        store[idx] = merged
        return mockResult(merged)
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Player', id }, { type: 'Player', id: 'LIST' }],
    }),

    deletePlayer: build.mutation<{ id: ID }, ID>({
      queryFn: (id) => {
        store = store.filter((p) => p.id !== id)
        return mockResult({ id })
      },
      invalidatesTags: [{ type: 'Player', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetPlayersQuery,
  useGetPlayerQuery,
  useCreatePlayerMutation,
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
} = playersApi
