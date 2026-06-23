import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, User } from 'lucide-react'
import { AuthLayout } from '@/components/auth/components/AuthLayout'
import { setCredentials } from '@/components/auth/authSlice'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { ROUTES } from '@/constants/routes'
import { useRegisterMutation } from '@/services/endpoints/authApi'
import { useAppDispatch } from '@/store/hooks'
import { useToast } from '@/hooks/useToast'

export function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const [register, { isLoading }] = useRegisterMutation()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }
    if (!agree) {
      setError('Please accept the terms to continue.')
      return
    }
    try {
      const result = await register(form).unwrap()
      dispatch(setCredentials(result))
      toast({ variant: 'success', title: 'Account created', description: 'Welcome to Botola Go Admin' })
      navigate(ROUTES.dashboard, { replace: true })
    } catch {
      setError('Could not create your account. Please try again.')
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Request access</h2>
        <p className="mt-1 text-sm text-slate-500">Create an admin account to get started.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Full name"
          name="name"
          value={form.name}
          onChange={update('name')}
          leftIcon={<User className="h-4 w-4" />}
          placeholder="Jane Doe"
        />
        <Input
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={update('email')}
          leftIcon={<Mail className="h-4 w-4" />}
          placeholder="you@botolago.app"
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={update('password')}
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Create a strong password"
          hint="Minimum 8 characters."
          error={error}
        />

        <Checkbox
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          label="I agree to the Terms & Conditions and Privacy Policy"
        />

        <Button type="submit" fullWidth size="lg" loading={isLoading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="font-semibold text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
