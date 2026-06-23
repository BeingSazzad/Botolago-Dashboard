import { cn, getInitials } from '@/lib/utils'

export interface AvatarProps {
  name: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

// Deterministic gradient from the name so avatars are colourful but stable.
const palettes = [
  'from-primary-500 to-primary-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-indigo-600',
  'from-violet-500 to-purple-700',
]

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const palette = palettes[name.charCodeAt(0) % palettes.length]
  return src ? (
    <img
      src={src}
      alt={name}
      className={cn('rounded-full object-cover ring-2 ring-white', sizes[size], className)}
    />
  ) : (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ring-2 ring-white',
        palette,
        sizes[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  )
}
