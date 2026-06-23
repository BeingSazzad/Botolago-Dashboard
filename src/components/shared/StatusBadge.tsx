import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { PLAYER_STATUS_META, POSITION_META, STATUS_META } from '@/lib/constants'
import type { EntityStatus, PlayerStatus, Position } from '@/types/common.types'
import { cn } from '@/lib/utils'

/** User/entity status pill driven by the shared STATUS_META table. */
export function StatusBadge({ status }: { status: EntityStatus }) {
  const meta = STATUS_META[status]
  return (
    <Badge variant={meta.variant as BadgeVariant} dot>
      {meta.label}
    </Badge>
  )
}

/** Player availability pill (Available / Doubtful / Injured / Suspended). */
export function PlayerStatusBadge({ status }: { status: PlayerStatus }) {
  const meta = PLAYER_STATUS_META[status]
  return (
    <Badge variant={meta.variant as BadgeVariant} dot>
      {meta.label}
    </Badge>
  )
}

/** Position chip (FWD / MID / DEF / GK) with position-specific colour. */
export function PositionBadge({ position }: { position: Position }) {
  const meta = POSITION_META[position]
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
        meta.tone,
      )}
    >
      {meta.short}
    </span>
  )
}
