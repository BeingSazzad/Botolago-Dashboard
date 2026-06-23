/**
 * Centralised route table. Always reference ROUTES.* instead of hard-coding
 * path strings so links stay consistent across the app.
 */
export const ROUTES = {
  // Auth
  login: '/login',
  register: '/register',

  // App
  dashboard: '/',
  analytics: '/analytics',

  // Football management
  players: '/players',
  playerNew: '/players/new',
  playerDetail: (id: string | number = ':id') => `/players/${id}`,
  scoring: '/scoring',

  fixtures: '/fixtures',
  fixtureNew: '/fixtures/new',
  fixtureDetail: (id: string | number = ':id') => `/fixtures/${id}`,
  gameweeks: '/gameweeks',
  leaderboard: '/leaderboard',

  // People
  users: '/users',
  userDetail: (id: string | number = ':id') => `/users/${id}`,
  teams: '/teams',
  teamDetail: (id: string | number = ':id') => `/teams/${id}`,

  // Content
  cms: '/cms',
  cmsPage: (slug: string = ':slug') => `/cms/${slug}`,
  faq: '/cms/faq',

  // Admin
  admins: '/admins',
  roles: '/roles',
  settings: '/settings',
  profile: '/profile',
} as const

export type AppRoute = typeof ROUTES
