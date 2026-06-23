import { NavLink, useLocation } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { useAuth } from '@/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setMobileSidebar, toggleSidebar } from '@/store/uiSlice'
import { cn } from '@/lib/utils'
import { NAV_SECTIONS } from './nav.config'

export function Sidebar() {
  const dispatch = useAppDispatch()
  const { can } = useAuth()
  const { pathname } = useLocation()
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed)
  const mobileOpen = useAppSelector((s) => s.ui.mobileSidebarOpen)

  const isActive = (to: string, match?: string[]) => {
    if (to === '/') return pathname === '/'
    if (match) return match.some((m) => pathname.startsWith(m))
    return pathname.startsWith(to)
  }

  const content = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={cn('flex h-16 items-center border-b border-slate-100 px-4', collapsed && 'justify-center px-0')}>
        <Logo compact={collapsed} />
        <button
          onClick={() => dispatch(setMobileSidebar(false))}
          className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((item) => can(item.permission))
          if (items.length === 0) return null
          return (
            <div key={section.title}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {items.map((item) => {
                  const active = isActive(item.to, item.match)
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={() => dispatch(setMobileSidebar(false))}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          collapsed && 'justify-center px-0',
                          active
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                        )}
                      >
                        <item.icon
                          className={cn('h-[18px] w-[18px] shrink-0', active && 'text-primary-600')}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* Collapse toggle (desktop) */}
      <div className="hidden border-t border-slate-100 p-3 lg:block">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="h-[18px] w-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-white transition-[width] duration-200 lg:block',
          collapsed ? 'w-[76px]' : 'w-64',
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => dispatch(setMobileSidebar(false))}
          />
          <aside className="absolute inset-y-0 left-0 w-64 animate-slide-in-right border-r border-slate-200 bg-white">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
