import { useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { useAppSelector } from '@/store/hooks'
import { getInitials } from '@/lib/utils'

const STADIUM_IMAGE =
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1400&q=80'

const highlights = [
  'Manage players, fixtures & live scoring',
  'Configure the fantasy points engine',
  'Moderate users, teams & leaderboards',
  'Publish T&C, FAQ and in-app content',
]

export function AuthLayout({ children }: { children: ReactNode }) {
  const { appName, logo } = useAppSelector((s) => s.branding)
  const [imgOk, setImgOk] = useState(true)

  return (
    <div className="flex min-h-screen bg-surface-muted">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-navy p-12 text-white lg:flex">
        {/* Stadium background image — hidden on load error so no broken-image icon shows */}
        {imgOk && (
          <img
            src={STADIUM_IMAGE}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setImgOk(false)}
          />
        )}

        {/* Dark navy gradient overlay — sits above the image, below all content */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/95 via-brand-navy/85 to-primary-900/90" />

        {/* Decorative blur blobs */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />

        {/* Logo lockup */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            {logo ? (
              <img src={logo} alt={appName} className="h-10 w-10 rounded-xl object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-primary-700">
                {getInitials(appName)}
              </div>
            )}
            <div>
              <p className="text-base font-bold">{appName}</p>
              <p className="text-xs text-white/60">Admin Console</p>
            </div>
          </div>
        </div>

        {/* Headline + highlights */}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold leading-tight">
            Run Morocco&apos;s most exciting
            <br />
            Botola Pro fantasy league.
          </h1>
          <p className="mt-3 max-w-md text-white/70">
            One console for your players, scoring, content and community.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/85">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-white/40">© 2026 {appName}. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
