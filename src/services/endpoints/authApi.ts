import type { AdminUser, LoginPayload } from '@/components/auth/types'
import { api } from '@/services/api'
import { admins } from '@/services/mock/data'
import { mockResult } from '@/services/mock/helpers'

interface AuthResult {
  user: AdminUser
  token: string
}

/**
 * Mock auth. Admin accounts are invite-only (managed under Admins & Roles), so
 * there is no public sign-up — only login. Any password is accepted; the email
 * is matched against the seeded admins (falling back to the super admin) so you
 * can explore every role.
 */
export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResult, LoginPayload>({
      queryFn: async ({ email }) => {
        const user = admins.find((a) => a.email.toLowerCase() === email.toLowerCase()) ?? admins[0]
        return mockResult({ user, token: `mock.jwt.${user.id}.${Date.now()}` }, 600)
      },
    }),
  }),
})

export const { useLoginMutation } = authApi
