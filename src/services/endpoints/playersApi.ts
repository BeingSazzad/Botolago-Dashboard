import type { Player, PlayerFormValues } from '@/components/players/types'
import { computeRating } from '@/lib/scoring'
import { api } from '@/services/api'
import { players as seed } from '@/services/mock/data'
import { mockResult, paginate } from '@/services/mock/helpers'
import type { ListResponse } from '@/types/api.types'
import type { ID, QueryParams } from '@/types/common.types'

/**
 * Players are sourced from the external sports data feed (roster + match stats)
 * — admins do NOT create or delete them. Only fantasy-owned fields (price,
 * availability) and manual stat corrections are editable via `updatePlayer`.
 */

// In-session store (rows are updated in place; never created/deleted by admins).
const store: Player[] = [...seed]

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
  }),
})

export const {
  useGetPlayersQuery,
  useGetPlayerQuery,
  useUpdatePlayerMutation,
} = playersApi
