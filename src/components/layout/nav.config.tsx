import {
  BarChart3,
  CalendarDays,
  FileText,
  LayoutDashboard,
  ListOrdered,
  Newspaper,
  Settings,
  Shield,
  Trophy,
  Users,
  Volleyball,
  Calculator,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import type { Permission } from '@/types/common.types'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  permission?: Permission
  /** Match nested routes for active state. */
  match?: string[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', to: ROUTES.dashboard, icon: LayoutDashboard, permission: 'dashboard.view' },
      { label: 'Analytics', to: ROUTES.analytics, icon: BarChart3, permission: 'dashboard.view' },
    ],
  },
  {
    title: 'Football',
    items: [
      {
        label: 'Players',
        to: ROUTES.players,
        icon: Volleyball,
        permission: 'players.view',
        match: ['/players'],
      },
      { label: 'Scoring Engine', to: ROUTES.scoring, icon: Calculator, permission: 'scoring.manage' },
      {
        label: 'Fixtures',
        to: ROUTES.fixtures,
        icon: CalendarDays,
        permission: 'fixtures.view',
        match: ['/fixtures'],
      },
      { label: 'Gameweeks', to: ROUTES.gameweeks, icon: ListOrdered, permission: 'fixtures.view' },
      { label: 'Leaderboard', to: ROUTES.leaderboard, icon: Trophy, permission: 'dashboard.view' },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Users', to: ROUTES.users, icon: Users, permission: 'users.view', match: ['/users'] },
      { label: 'Teams', to: ROUTES.teams, icon: Shield, permission: 'users.view' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'CMS & FAQ', to: ROUTES.cms, icon: FileText, permission: 'cms.view', match: ['/cms'] },
      { label: 'News & Blog', to: ROUTES.news, icon: Newspaper, permission: 'cms.view', match: ['/news'] },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Admins & Roles', to: ROUTES.admins, icon: Shield, permission: 'admins.manage', match: ['/admins', '/roles'] },
      { label: 'Settings', to: ROUTES.settings, icon: Settings, permission: 'settings.manage' },
    ],
  },
]
