import { useState } from 'react'
import { KeyRound, Shield, User } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/shared/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { updateProfile } from '@/components/auth/authSlice'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useAppDispatch } from '@/store/hooks'
import { ADMIN_ROLES, PERMISSION_GROUPS } from '@/lib/constants'
import { titleCase } from '@/lib/utils'
import type { Permission } from '@/types/common.types'

// ─── Profile Summary Card ─────────────────────────────────────────────────────

function ProfileSummaryCard() {
  const { user } = useAuth()
  if (!user) return null

  const statusVariant =
    user.status === 'active' ? 'success' : user.status === 'invited' ? 'info' : 'warning'

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <Avatar name={user.name} src={user.avatarUrl} size="lg" className="h-20 w-20 text-2xl" />
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{user.name}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="primary">{user.roleName}</Badge>
          <Badge variant={statusVariant} dot>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Edit Profile Card ────────────────────────────────────────────────────────

function EditProfileCard() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const toast = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')

  if (!user) return null

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      toast({ variant: 'error', title: 'Validation error', message: 'Name and email are required.' })
      return
    }
    dispatch(updateProfile({ name: name.trim(), email: email.trim() }))
    toast({ variant: 'success', title: 'Profile updated', message: 'Your details have been saved.' })
  }

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <span>Edit profile</span>
          </div>
        }
        description="Update your display name and email address."
      />
      <CardContent className="space-y-4">
        <Input
          label="Full name"
          name="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
        />
        <Input
          label="Email address"
          name="profile-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
        />
        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleSave}>
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Permissions Card ─────────────────────────────────────────────────────────

function PermissionsCard() {
  const { user, isSuperAdmin } = useAuth()
  if (!user) return null

  const effectivePerms: Permission[] = isSuperAdmin
    ? []
    : Array.isArray(user.permissions) && user.permissions.length > 0
    ? (user.permissions as Permission[])
    : Array.isArray(ADMIN_ROLES[user.role]?.permissions)
    ? (ADMIN_ROLES[user.role].permissions as Permission[])
    : []

  // Group the permissions for a cleaner display
  const grouped = PERMISSION_GROUPS.flatMap((g) =>
    g.permissions.filter((p) => effectivePerms.includes(p.key)).map((p) => ({ ...p, group: g.group })),
  )

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-400" />
            <span>Permissions</span>
          </div>
        }
        description="Your effective access rights based on your assigned role."
      />
      <CardContent>
        {isSuperAdmin ? (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3">
            <Shield className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-medium text-amber-700">
              Full access (Super Admin) — all permissions are granted.
            </p>
          </div>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-slate-500">No permissions assigned.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {grouped.map((p) => (
              <Badge key={p.key} variant="neutral">
                {p.label ?? titleCase(p.key)}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Change Password Card ─────────────────────────────────────────────────────

function ChangePasswordCard() {
  const toast = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [confirmError, setConfirmError] = useState('')

  const handleChange = () => {
    setConfirmError('')
    if (!current || !next || !confirm) {
      toast({ variant: 'error', title: 'All fields are required.' })
      return
    }
    if (next !== confirm) {
      setConfirmError('Passwords do not match.')
      return
    }
    // Demo only — no real password logic
    setCurrent('')
    setNext('')
    setConfirm('')
    toast({ variant: 'success', title: 'Password changed', message: 'Your password has been updated.' })
  }

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-slate-400" />
            <span>Change password</span>
          </div>
        }
        description="Choose a strong, unique password for your account."
      />
      <CardContent className="space-y-4">
        <Input
          label="Current password"
          name="current-password"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="••••••••"
        />
        <Input
          label="New password"
          name="new-password"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="••••••••"
        />
        <Input
          label="Confirm new password"
          name="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value)
            if (confirmError) setConfirmError('')
          }}
          placeholder="••••••••"
          error={confirmError}
        />
        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleChange}>
            Change password
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div>
        <PageHeader title="My Profile" />
        <p className="text-sm text-slate-500">No user session found.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="My Profile" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — summary */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <ProfileSummaryCard />
          <PermissionsCard />
        </div>

        {/* Right column — editable cards */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <EditProfileCard />
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  )
}
