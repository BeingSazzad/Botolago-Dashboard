import type {
  AdminRole,
  EntityStatus,
  Permission,
  PlayerStatus,
  Position,
  SelectOption,
} from '@/types/common.types'

/** All permissions, grouped for the role editor UI. */
export const PERMISSION_GROUPS: { group: string; permissions: { key: Permission; label: string }[] }[] =
  [
    {
      group: 'Overview',
      permissions: [{ key: 'dashboard.view', label: 'View dashboard' }],
    },
    {
      group: 'Users & Teams',
      permissions: [
        { key: 'users.view', label: 'View users' },
        { key: 'users.manage', label: 'Manage users' },
      ],
    },
    {
      group: 'Football',
      permissions: [
        { key: 'players.view', label: 'View players' },
        { key: 'players.manage', label: 'Manage players' },
        { key: 'fixtures.view', label: 'View fixtures' },
        { key: 'fixtures.manage', label: 'Manage fixtures' },
        { key: 'scoring.manage', label: 'Manage scoring' },
      ],
    },
    {
      group: 'Content',
      permissions: [
        { key: 'cms.view', label: 'View content' },
        { key: 'cms.manage', label: 'Manage content' },
      ],
    },
    {
      group: 'Administration',
      permissions: [
        { key: 'admins.manage', label: 'Manage admins & roles' },
        { key: 'settings.manage', label: 'Manage settings' },
      ],
    },
  ]

/** Pre-defined RBAC roles. `super_admin` has the wildcard. */
export const ADMIN_ROLES: Record<string, AdminRole> = {
  super_admin: {
    key: 'super_admin',
    name: 'Super Admin',
    description: 'Full, unrestricted access to every part of the platform.',
    permissions: '*',
  },
  admin: {
    key: 'admin',
    name: 'Admin',
    description: 'Manage football data, users and content. No admin/role control.',
    permissions: [
      'dashboard.view',
      'users.view',
      'users.manage',
      'players.view',
      'players.manage',
      'fixtures.view',
      'fixtures.manage',
      'scoring.manage',
      'cms.view',
      'cms.manage',
    ],
  },
  editor: {
    key: 'editor',
    name: 'Content Editor',
    description: 'Create and publish CMS content, FAQs and legal pages.',
    permissions: ['dashboard.view', 'cms.view', 'cms.manage', 'players.view', 'fixtures.view'],
  },
  analyst: {
    key: 'analyst',
    name: 'Analyst',
    description: 'Read-only access to analytics, users and football data.',
    permissions: [
      'dashboard.view',
      'users.view',
      'players.view',
      'fixtures.view',
      'cms.view',
    ],
  },
}

export const POSITIONS: Position[] = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper']

export const POSITION_OPTIONS: SelectOption<Position>[] = POSITIONS.map((p) => ({
  label: p,
  value: p,
}))

/** Short code + theming per position, reused by badges and tables. */
export const POSITION_META: Record<Position, { short: string; tone: string }> = {
  Forward: { short: 'FWD', tone: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
  Midfielder: { short: 'MID', tone: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  Defender: { short: 'DEF', tone: 'bg-sky-50 text-sky-700 ring-sky-600/20' },
  Goalkeeper: { short: 'GK', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
}

/** User/entity status -> badge variant mapping. */
export const STATUS_META: Record<EntityStatus, { label: string; variant: string }> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'neutral' },
  suspended: { label: 'Suspended', variant: 'warning' },
  banned: { label: 'Banned', variant: 'danger' },
  pending: { label: 'Pending', variant: 'info' },
}

/** Player availability status -> badge variant mapping (from the data feed). */
export const PLAYER_STATUS_META: Record<PlayerStatus, { label: string; variant: string }> = {
  available: { label: 'Available', variant: 'success' },
  doubtful: { label: 'Doubtful', variant: 'warning' },
  injured: { label: 'Injured', variant: 'danger' },
  suspended: { label: 'Suspended', variant: 'info' },
}

export const PLAYER_STATUS_OPTIONS: SelectOption<PlayerStatus>[] = (
  Object.keys(PLAYER_STATUS_META) as PlayerStatus[]
).map((s) => ({ label: PLAYER_STATUS_META[s].label, value: s }))

/** Botola Pro 1 (Moroccan top division) club set used by the mock data + selects. */
export const CLUBS: { name: string; short: string }[] = [
  { name: 'Raja Casablanca', short: 'RCA' },
  { name: 'Wydad AC', short: 'WAC' },
  { name: 'AS FAR', short: 'FAR' },
  { name: 'RS Berkane', short: 'RSB' },
  { name: 'FUS Rabat', short: 'FUS' },
  { name: 'Maghreb Fès', short: 'MAS' },
  { name: 'Hassania Agadir', short: 'HUS' },
  { name: 'Olympique Safi', short: 'OCS' },
  { name: 'Moghreb Tétouan', short: 'MAT' },
  { name: 'Difaâ El Jadida', short: 'DHJ' },
  { name: 'Chabab Mohammédia', short: 'CHM' },
  { name: 'Mouloudia Oujda', short: 'MCO' },
]

export const CLUB_OPTIONS: SelectOption[] = CLUBS.map((c) => ({ label: c.name, value: c.name }))
