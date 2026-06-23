import { useCallback, useMemo } from 'react'
import { logout as logoutAction } from '@/components/auth/authSlice'
import { ADMIN_ROLES } from '@/lib/constants'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { Permission } from '@/types/common.types'

/**
 * Central auth hook. Resolves the current admin's effective permission set
 * (role defaults + any per-user overrides) and exposes a `can()` guard.
 */
export function useAuth() {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((s) => s.auth)

  const permissions = useMemo<Set<Permission> | '*'>(() => {
    if (!user) return new Set<Permission>()

    const role = ADMIN_ROLES[user.role]
    if (role?.permissions === '*' || user.permissions === '*') return '*'

    const set = new Set<Permission>()
    if (Array.isArray(role?.permissions)) role.permissions.forEach((p) => set.add(p))
    if (Array.isArray(user.permissions)) user.permissions.forEach((p) => set.add(p))
    return set
  }, [user])

  const can = useCallback(
    (permission?: Permission) => {
      if (!permission) return true
      if (permissions === '*') return true
      return permissions.has(permission)
    },
    [permissions],
  )

  const logout = useCallback(() => dispatch(logoutAction()), [dispatch])

  return { user, isAuthenticated, can, logout, isSuperAdmin: permissions === '*' }
}
