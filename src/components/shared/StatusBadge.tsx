import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { POSITION_META, STATUS_META } from '@/lib/constants'
import type { EntityStatus, Position } from '@/types/common.types'
import { cn } from '@/lib/utils'

/** Status pill driven by the shared STATUS_META table. */
export function StatusBadge({ status }: { status: EntityStatus }) {
  const meta = STATUS_META[status]
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
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
        meta.tone,
      )}
    >
      {meta.short}
    </span>
  )
}
