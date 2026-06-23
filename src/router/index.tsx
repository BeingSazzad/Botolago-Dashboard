import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ROUTES } from '@/constants/routes'
import { PrivateRoute } from './PrivateRoute'

// Auth
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
// Dashboard
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { AnalyticsPage } from '@/pages/dashboard/AnalyticsPage'
// Football
import { PlayersPage } from '@/pages/players/PlayersPage'
import { PlayerFormPage } from '@/pages/players/PlayerFormPage'
import { PlayerDetailPage } from '@/pages/players/PlayerDetailPage'
import { ScoringPage } from '@/pages/scoring/ScoringPage'
import { FixturesPage } from '@/pages/fixtures/FixturesPage'
import { FixtureDetailPage } from '@/pages/fixtures/FixtureDetailPage'
import { GameweeksPage } from '@/pages/fixtures/GameweeksPage'
import { LeaderboardPage } from '@/pages/leaderboard/LeaderboardPage'
// People
import { UsersPage } from '@/pages/users/UsersPage'
import { UserDetailPage } from '@/pages/users/UserDetailPage'
import { TeamsPage } from '@/pages/users/TeamsPage'
import { TeamDetailPage } from '@/pages/users/TeamDetailPage'
// Content
import { CmsPage } from '@/pages/cms/CmsPage'
import { CmsEditorPage } from '@/pages/cms/CmsEditorPage'
// Admin
import { AdminsPage } from '@/pages/admins/AdminsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
// Fallback
import { NotFoundPage } from '@/pages/NotFoundPage'

const protect = (element: React.ReactNode, permission?: Parameters<typeof PrivateRoute>[0]['permission']) => (
  <PrivateRoute permission={permission}>{element}</PrivateRoute>
)

export const router = createBrowserRouter([
  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTES.register, element: <RegisterPage /> },
  {
    path: '/',
    element: <PrivateRoute><AdminLayout /></PrivateRoute>,
    children: [
      { index: true, element: protect(<DashboardPage />, 'dashboard.view') },
      { path: 'analytics', element: protect(<AnalyticsPage />, 'dashboard.view') },

      { path: 'players', element: protect(<PlayersPage />, 'players.view') },
      { path: 'players/new', element: protect(<PlayerFormPage />, 'players.manage') },
      { path: 'players/:id', element: protect(<PlayerDetailPage />, 'players.view') },
      { path: 'players/:id/edit', element: protect(<PlayerFormPage />, 'players.manage') },
      { path: 'scoring', element: protect(<ScoringPage />, 'scoring.manage') },
      { path: 'fixtures', element: protect(<FixturesPage />, 'fixtures.view') },
      { path: 'fixtures/:id', element: protect(<FixtureDetailPage />, 'fixtures.view') },
      { path: 'gameweeks', element: protect(<GameweeksPage />, 'fixtures.view') },
      { path: 'leaderboard', element: protect(<LeaderboardPage />, 'dashboard.view') },

      { path: 'users', element: protect(<UsersPage />, 'users.view') },
      { path: 'users/:id', element: protect(<UserDetailPage />, 'users.view') },
      { path: 'teams', element: protect(<TeamsPage />, 'users.view') },
      { path: 'teams/:id', element: protect(<TeamDetailPage />, 'users.view') },

      { path: 'cms', element: protect(<CmsPage />, 'cms.view') },
      { path: 'cms/:slug', element: protect(<CmsEditorPage />, 'cms.manage') },

      { path: 'admins', element: protect(<AdminsPage />, 'admins.manage') },
      { path: 'roles', element: <Navigate to={ROUTES.admins} replace /> },
      { path: 'settings', element: protect(<SettingsPage />, 'settings.manage') },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
