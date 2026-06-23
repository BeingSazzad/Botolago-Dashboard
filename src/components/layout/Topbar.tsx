import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, Search, Settings, User } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { Dropdown } from '@/components/ui/Dropdown'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { useAppDispatch } from '@/store/hooks'
import { setMobileSidebar } from '@/store/uiSlice'

export function Topbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={() => dispatch(setMobileSidebar(true))}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Global search */}
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search players, users, fixtures…"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Notifications */}
        <Dropdown
          align="right"
          trigger={
            <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          }
          items={[
            { label: 'Gameweek 3 deadline in 2h', onClick: () => navigate(ROUTES.gameweeks) },
            { label: '3 players need score review', onClick: () => navigate(ROUTES.scoring) },
            { label: 'New admin invite accepted', onClick: () => navigate(ROUTES.admins) },
          ]}
        />

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

        {/* User menu */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2.5 rounded-lg p-1 pr-2 transition-colors hover:bg-slate-100">
              <Avatar name={user?.name ?? 'Admin'} src={user?.avatarUrl} size="sm" />
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold leading-tight text-slate-800">
                  {user?.name ?? 'Admin'}
                </span>
                <span className="block text-[11px] leading-tight text-slate-400">
                  {user?.roleName ?? 'Administrator'}
                </span>
              </span>
            </button>
          }
          items={[
            { label: 'My Profile', icon: <User className="h-4 w-4" />, onClick: () => navigate(ROUTES.profile) },
            { label: 'Settings', icon: <Settings className="h-4 w-4" />, onClick: () => navigate(ROUTES.settings) },
            { label: 'Sign out', icon: <LogOut className="h-4 w-4" />, destructive: true, onClick: () => { logout(); navigate(ROUTES.login) } },
          ]}
        />
      </div>
    </header>
  )
}
