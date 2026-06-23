import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * Base RTK Query API.
 *
 * Frontend-only mode: we use `fakeBaseQuery` and resolve every endpoint with a
 * `queryFn` against the in-memory mock store. Swapping to a real backend later
 * is a one-line change to `fetchBaseQuery({ baseUrl, prepareHeaders })` plus
 * converting `queryFn` endpoints to `query`.
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'Player',
    'User',
    'Team',
    'Fixture',
    'Gameweek',
    'CmsPage',
    'Faq',
    'Admin',
    'Dashboard',
  ],
  endpoints: () => ({}),
})
