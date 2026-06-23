import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Permission } from '@/types/common.types'

export interface PermissionGateProps {
  /** Required permission. If omitted, always renders. */
  permission?: Permission
  children: ReactNode
  /** Rendered when the user lacks the permission. */
  fallback?: ReactNode
}

/**
 * Conditionally render children based on the current admin's permissions.
 * Use to hide buttons / nav items the user cannot action.
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { can } = useAuth()
  return <>{can(permission) ? children : fallback}</>
}
