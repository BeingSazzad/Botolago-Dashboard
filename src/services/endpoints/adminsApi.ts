import type { AdminUser } from '@/components/auth/types'
import { ADMIN_ROLES } from '@/lib/constants'
import { api } from '@/services/api'
import { admins as seed } from '@/services/mock/data'
import { mockResult, nextId } from '@/services/mock/helpers'
import type { AdminRole, AdminRoleKey, ID } from '@/types/common.types'

let store: AdminUser[] = [...seed]
let roles: Record<string, AdminRole> = { ...ADMIN_ROLES }

export const adminsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAdmins: build.query<AdminUser[], void>({
      queryFn: () => mockResult([...store]),
      providesTags: [{ type: 'Admin', id: 'LIST' }],
    }),

    inviteAdmin: build.mutation<
      AdminUser,
      { name: string; email: string; role: AdminRoleKey; avatarUrl?: string }
    >({
      queryFn: ({ name, email, role, avatarUrl }) => {
        const admin: AdminUser = {
          id: nextId('adm'),
          name,
          email,
          role,
          roleName: roles[role]?.name ?? role,
          permissions: [],
          avatarUrl,
          status: 'invited',
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }
        store = [...store, admin]
        return mockResult(admin)
      },
      invalidatesTags: [{ type: 'Admin', id: 'LIST' }],
    }),

    updateAdmin: build.mutation<AdminUser, { id: ID; changes: Partial<AdminUser> }>({
      queryFn: ({ id, changes }) => {
        const idx = store.findIndex((a) => a.id === id)
        if (idx === -1) return { error: { status: 404, message: 'Admin not found' } }
        store[idx] = { ...store[idx], ...changes }
        return mockResult(store[idx])
      },
      invalidatesTags: [{ type: 'Admin', id: 'LIST' }],
    }),

    deleteAdmin: build.mutation<{ id: ID }, ID>({
      queryFn: (id) => {
        store = store.filter((a) => a.id !== id)
        return mockResult({ id })
      },
      invalidatesTags: [{ type: 'Admin', id: 'LIST' }],
    }),

    /* ---- Roles ---- */
    getRoles: build.query<AdminRole[], void>({
      queryFn: () => mockResult(Object.values(roles)),
      providesTags: [{ type: 'Admin', id: 'ROLES' }],
    }),

    updateRole: build.mutation<AdminRole, AdminRole>({
      queryFn: (role) => {
        roles = { ...roles, [role.key]: role }
        return mockResult(role)
      },
      invalidatesTags: [{ type: 'Admin', id: 'ROLES' }],
    }),
  }),
})

export const {
  useGetAdminsQuery,
  useInviteAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetRolesQuery,
  useUpdateRoleMutation,
} = adminsApi
