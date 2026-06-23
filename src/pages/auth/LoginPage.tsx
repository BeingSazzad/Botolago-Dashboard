import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { AuthLayout } from '@/components/auth/components/AuthLayout'
import { setCredentials } from '@/components/auth/authSlice'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { ROUTES } from '@/constants/routes'
import { useLoginMutation } from '@/services/endpoints/authApi'
import { useAppDispatch } from '@/store/hooks'
import { useToast } from '@/hooks/useToast'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [login, { isLoading }] = useLoginMutation()

  const [email, setEmail] = useState('binarybards27@gmail.com')
  const [password, setPassword] = useState('demo1234')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? ROUTES.dashboard

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    try {
      const result = await login({ email, password }).unwrap()
      dispatch(setCredentials(result))
      toast({ variant: 'success', title: 'Welcome back', description: `Signed in as ${result.user.name}` })
      navigate(from, { replace: true })
    } catch {
      setError('Invalid credentials. Please try again.')
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
        <p className="mt-1 text-sm text-slate-500">Welcome back — enter your details to continue.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          placeholder="you@botolago.app"
        />
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          placeholder="••••••••"
          error={error}
        />

        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" defaultChecked />
          <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Forgot password?
          </button>
        </div>

        <Button type="submit" fullWidth size="lg" loading={isLoading}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Admin access is invite-only. Contact a Super Admin to be added.
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500">
        <span className="font-medium text-slate-600">Demo:</span> any password works. Try{' '}
        <code className="rounded bg-white px-1 py-0.5 text-primary-700">sophia@botolago.app</code>{' '}
        (Admin) or{' '}
        <code className="rounded bg-white px-1 py-0.5 text-primary-700">mei@botolago.app</code>{' '}
        (Analyst) to see roles.
      </div>
    </AuthLayout>
  )
}
