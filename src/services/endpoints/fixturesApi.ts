import type { Fixture, Gameweek } from '@/components/fixtures/types'
import { api } from '@/services/api'
import { fixtures as fxSeed, gameweeks as gwSeed } from '@/services/mock/data'
import { mockResult, nextId, paginate } from '@/services/mock/helpers'
import type { ListResponse } from '@/types/api.types'
import type { ID, QueryParams } from '@/types/common.types'

let fxStore: Fixture[] = [...fxSeed]

export const fixturesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getFixtures: build.query<ListResponse<Fixture>, QueryParams | void>({
      queryFn: (params) =>
        mockResult(paginate(fxStore, params ?? {}, ['homeClub', 'awayClub', 'venue'])),
      providesTags: [{ type: 'Fixture', id: 'LIST' }],
    }),

    getFixture: build.query<Fixture, ID>({
      queryFn: (id) => {
        const fixture = fxStore.find((f) => f.id === id)
        return fixture ? mockResult(fixture) : { error: { status: 404, message: 'Fixture not found' } }
      },
      providesTags: (_r, _e, id) => [{ type: 'Fixture', id }],
    }),

    createFixture: build.mutation<Fixture, Omit<Fixture, 'id'>>({
      queryFn: (values) => {
        const fixture: Fixture = { ...values, id: nextId('fx') }
        fxStore = [fixture, ...fxStore]
        return mockResult(fixture)
      },
      invalidatesTags: [{ type: 'Fixture', id: 'LIST' }],
    }),

    updateFixture: build.mutation<Fixture, { id: ID; changes: Partial<Fixture> }>({
      queryFn: ({ id, changes }) => {
        const idx = fxStore.findIndex((f) => f.id === id)
        if (idx === -1) return { error: { status: 404, message: 'Fixture not found' } }
        fxStore[idx] = { ...fxStore[idx], ...changes }
        return mockResult(fxStore[idx])
      },
      invalidatesTags: [{ type: 'Fixture', id: 'LIST' }],
    }),

    deleteFixture: build.mutation<{ id: ID }, ID>({
      queryFn: (id) => {
        fxStore = fxStore.filter((f) => f.id !== id)
        return mockResult({ id })
      },
      invalidatesTags: [{ type: 'Fixture', id: 'LIST' }],
    }),

    getGameweeks: build.query<Gameweek[], void>({
      queryFn: () => mockResult([...gwSeed]),
      providesTags: [{ type: 'Gameweek', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetFixturesQuery,
  useGetFixtureQuery,
  useCreateFixtureMutation,
  useUpdateFixtureMutation,
  useDeleteFixtureMutation,
  useGetGameweeksQuery,
} = fixturesApi
