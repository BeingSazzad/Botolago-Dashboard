import { useAppSelector } from '@/store/hooks'
import { cn, getInitials } from '@/lib/utils'

export interface LogoProps {
  /** Hide the wordmark, show only the badge (collapsed sidebar). */
  compact?: boolean
  className?: string
}

/** Brand lockup — uploaded logo or initials badge + wordmark, from branding state. */
export function Logo({ compact, className }: LogoProps) {
  const { appName, logo } = useAppSelector((s) => s.branding)
  const initials = getInitials(appName)

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {logo ? (
        <img
          src={logo}
          alt={appName}
          className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-sm"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-sm font-extrabold text-white shadow-sm">
          {initials}
        </div>
      )}
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-slate-900">{appName}</p>
          <p className="text-[11px] font-medium text-slate-400">Admin Console</p>
        </div>
      )}
    </div>
  )
}
