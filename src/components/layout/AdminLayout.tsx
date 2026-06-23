import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/shared/Toaster'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AdminLayout() {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed)

  return (
    <div className="min-h-screen bg-surface-muted">
      <Sidebar />
      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <Topbar />
        <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}
