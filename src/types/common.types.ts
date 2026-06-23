/** Shared primitive + domain types used across the admin app. */

export type ID = string

export type Position = 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper'

export type EntityStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'pending'

export type FixtureStatus = 'scheduled' | 'live' | 'finished' | 'postponed'

export type GameweekStatus = 'upcoming' | 'live' | 'finished'

export type ContentStatus = 'draft' | 'published' | 'archived'

/** RBAC ------------------------------------------------------------------ */

export type AdminRoleKey = 'super_admin' | 'admin' | 'editor' | 'analyst'

export type Permission =
  | 'dashboard.view'
  | 'users.view'
  | 'users.manage'
  | 'players.view'
  | 'players.manage'
  | 'fixtures.view'
  | 'fixtures.manage'
  | 'scoring.manage'
  | 'cms.view'
  | 'cms.manage'
  | 'admins.manage'
  | 'settings.manage'

export interface AdminRole {
  key: AdminRoleKey
  name: string
  description: string
  permissions: Permission[] | '*'
}

/** Player stat line used by the scoring engine. */
export interface MatchStats {
  G: number // goals
  A: number // assists
  CS: number // clean sheet (0/1)
  SoT: number // shots on target
  T: number // tackles / defensive actions
  S: number // saves (GK)
  M: number // minutes played
  YC: number // yellow cards
  RC: number // red cards
  OG: number // own goals
}

/** Pagination envelope returned by the (mock) API. */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface QueryParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  [key: string]: unknown
}

export interface SelectOption<T = string> {
  label: string
  value: T
}
