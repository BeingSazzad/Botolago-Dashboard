import type { AdminRoleKey, ID, Permission } from '@/types/common.types'

export interface AdminUser {
  id: ID
  name: string
  email: string
  role: AdminRoleKey
  roleName: string
  permissions: Permission[] | '*'
  avatarUrl?: string
  status: 'active' | 'invited' | 'suspended'
  lastLoginAt: string
  createdAt: string
}

export interface AuthState {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginPayload {
  email: string
  password: string
}
