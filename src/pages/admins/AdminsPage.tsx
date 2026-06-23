import { useState } from 'react'
import { MoreVertical, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/shared/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable, type Column } from '@/components/ui/Table'
import { Dropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import { ADMIN_ROLES, PERMISSION_GROUPS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import {
  useGetAdminsQuery,
  useInviteAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetRolesQuery,
  useUpdateRoleMutation,
} from '@/services/endpoints/adminsApi'
import type { AdminUser } from '@/components/auth/types'
import type { AdminRole, AdminRoleKey, Permission } from '@/types/common.types'
import { useToast } from '@/hooks/useToast'

const TABS = [
  { value: 'admins', label: 'Admins' },
  { value: 'roles', label: 'Roles' },
]

const ROLE_OPTIONS = Object.values(ADMIN_ROLES).map((r) => ({
  label: r.name,
  value: r.key,
}))

// ─── Invite Modal ────────────────────────────────────────────────────────────

function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const [inviteAdmin, { isLoading }] = useInviteAdminMutation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AdminRoleKey>('admin')

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) return
    try {
      await inviteAdmin({ name: name.trim(), email: email.trim(), role }).unwrap()
      toast({ variant: 'success', title: 'Invitation sent', message: `${name} has been invited.` })
      setName('')
      setEmail('')
      setRole('admin')
      onClose()
    } catch {
      toast({ variant: 'error', title: 'Failed to invite admin' })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite admin"
      description="Send an invitation to a new team member."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            Send invite
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Full name"
          name="invite-name"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Email address"
          name="invite-email"
          type="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select
          label="Role"
          name="invite-role"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(e) => setRole(e.target.value as AdminRoleKey)}
        />
      </div>
    </Modal>
  )
}

// ─── Change Role Modal ────────────────────────────────────────────────────────

function ChangeRoleModal({
  admin,
  onClose,
}: {
  admin: AdminUser | null
  onClose: () => void
}) {
  const toast = useToast()
  const [updateAdmin, { isLoading }] = useUpdateAdminMutation()
  const [role, setRole] = useState<AdminRoleKey>(admin?.role ?? 'admin')

  const handleSave = async () => {
    if (!admin) return
    const selectedRole = ADMIN_ROLES[role]
    try {
      await updateAdmin({
        id: admin.id,
        changes: { role, roleName: selectedRole?.name ?? role },
      }).unwrap()
      toast({ variant: 'success', title: 'Role updated' })
      onClose()
    } catch {
      toast({ variant: 'error', title: 'Failed to update role' })
    }
  }

  return (
    <Modal
      open={!!admin}
      onClose={onClose}
      title="Change role"
      description={`Update the role for ${admin?.name ?? ''}.`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={isLoading}>
            Save
          </Button>
        </>
      }
    >
      <Select
        label="Role"
        name="change-role"
        options={ROLE_OPTIONS}
        value={role}
        onChange={(e) => setRole(e.target.value as AdminRoleKey)}
      />
    </Modal>
  )
}

// ─── Admins Tab ───────────────────────────────────────────────────────────────

function AdminsTab() {
  const toast = useToast()
  const { data: admins = [], isLoading } = useGetAdminsQuery()
  const [updateAdmin, { isLoading: updatingId }] = useUpdateAdminMutation()
  const [deleteAdmin, { isLoading: deletingId }] = useDeleteAdminMutation()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [changeRoleTarget, setChangeRoleTarget] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  const handleToggleStatus = async (admin: AdminUser) => {
    const newStatus = admin.status === 'suspended' ? 'active' : 'suspended'
    try {
      await updateAdmin({ id: admin.id, changes: { status: newStatus } }).unwrap()
      toast({
        variant: 'success',
        title: newStatus === 'suspended' ? 'Admin suspended' : 'Admin reactivated',
      })
    } catch {
      toast({ variant: 'error', title: 'Failed to update status' })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteAdmin(deleteTarget.id).unwrap()
      toast({ variant: 'success', title: 'Admin removed' })
      setDeleteTarget(null)
    } catch {
      toast({ variant: 'error', title: 'Failed to remove admin' })
    }
  }

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Admin',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} src={row.avatarUrl} size="sm" />
          <div>
            <p className="font-medium text-slate-800">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <Badge variant="primary">{row.roleName}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variant =
          row.status === 'active' ? 'success' : row.status === 'invited' ? 'info' : 'warning'
        return (
          <Badge variant={variant} dot>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Badge>
        )
      },
    },
    {
      key: 'lastLoginAt',
      header: 'Last login',
      render: (row) =>
        row.lastLoginAt ? (
          <span className="text-slate-500">{formatDate(row.lastLoginAt, true)}</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => (
        <span className="text-slate-500">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '60px',
      render: (row) => (
        <Dropdown
          trigger={
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
          items={[
            {
              label: 'Change role',
              onClick: () => setChangeRoleTarget(row),
            },
            {
              label: row.status === 'suspended' ? 'Activate' : 'Suspend',
              onClick: () => handleToggleStatus(row),
              disabled: updatingId,
            },
            {
              label: 'Remove',
              destructive: true,
              onClick: () => setDeleteTarget(row),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setInviteOpen(true)}>
          Invite admin
        </Button>
      </div>

      <DataTable<AdminUser>
        columns={columns}
        data={admins}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle="No admins yet"
        emptyDescription="Invite your first team member to get started."
      />

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <ChangeRoleModal
        admin={changeRoleTarget}
        onClose={() => setChangeRoleTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove admin"
        message={`Are you sure you want to remove ${deleteTarget?.name ?? 'this admin'}? They will immediately lose access.`}
        confirmLabel="Remove"
        destructive
        loading={deletingId}
      />
    </>
  )
}

// ─── Role Card ────────────────────────────────────────────────────────────────

function RoleCard({ role }: { role: AdminRole }) {
  const toast = useToast()
  const [updateRole, { isLoading }] = useUpdateRoleMutation()

  const isWildcard = role.permissions === '*'
  const [localPerms, setLocalPerms] = useState<Permission[]>(
    isWildcard ? [] : (role.permissions as Permission[]),
  )

  const toggle = (key: Permission) => {
    setLocalPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    )
  }

  const handleSave = async () => {
    try {
      await updateRole({ ...role, permissions: isWildcard ? '*' : localPerms }).unwrap()
      toast({ variant: 'success', title: 'Role saved', message: `${role.name} permissions updated.` })
    } catch {
      toast({ variant: 'error', title: 'Failed to save role' })
    }
  }

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <span>{role.name}</span>
            {isWildcard && <Badge variant="warning">Full access</Badge>}
          </div>
        }
        description={role.description}
      />
      <CardContent className="space-y-5">
        {isWildcard ? (
          <p className="text-sm text-slate-500">
            This role has unrestricted access to every part of the platform. Permissions cannot be
            individually scoped.
          </p>
        ) : (
          PERMISSION_GROUPS.map((group) => (
            <div key={group.group}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {group.group}
              </p>
              <div className="space-y-2">
                {group.permissions.map((perm) => (
                  <Checkbox
                    key={perm.key}
                    name={`${role.key}-${perm.key}`}
                    label={perm.label}
                    checked={localPerms.includes(perm.key)}
                    onChange={() => toggle(perm.key)}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        <div className="flex justify-end pt-2">
          <Button size="sm" onClick={handleSave} loading={isLoading} disabled={isWildcard}>
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Roles Tab ────────────────────────────────────────────────────────────────

function RolesTab() {
  const { data: roles = [], isLoading } = useGetRolesQuery()

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="h-48 animate-pulse bg-slate-50" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {roles.map((role) => (
        <RoleCard key={role.key} role={role} />
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function AdminsPage() {
  const [activeTab, setActiveTab] = useState('admins')

  return (
    <div>
      <PageHeader
        title="Admins & Roles"
        description="Manage who can access the console and what they can do."
      />

      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'admins' ? <AdminsTab /> : <RolesTab />}
    </div>
  )
}
