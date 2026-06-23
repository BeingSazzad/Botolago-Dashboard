import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import type { Permission } from '@/types/common.types'
import { Forbidden } from '@/pages/ForbiddenPage'

export interface PrivateRouteProps {
  children: ReactNode
  /** Optional permission required to view the route. */
  permission?: Permission
}

/**
 * Auth guard. Redirects unauthenticated users to login (preserving the
 * intended destination) and shows a 403 screen when the user lacks the
 * required permission.
 */
export function PrivateRoute({ children, permission }: PrivateRouteProps) {
  const location = useLocation()
  const { isAuthenticated, can } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  if (permission && !can(permission)) {
    return <Forbidden />
  }

  return <>{children}</>
}
