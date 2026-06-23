import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export interface DropdownItem {
  label: string
  icon?: ReactNode
  onClick?: () => void
  destructive?: boolean
  disabled?: boolean
}

export interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number }>({ top: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Position the (portalled) menu against the trigger so table overflow can't clip it.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos(
      align === 'right'
        ? { top: r.bottom + 4, right: Math.max(8, window.innerWidth - r.right) }
        : { top: r.bottom + 4, left: r.left },
    )
  }, [open, align])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const close = () => setOpen(false)
    document.addEventListener('mousedown', onPointer)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex"
        onClick={(e) => {
          // Stop the row's onClick (navigation) and toggle the menu.
          e.stopPropagation()
          setOpen((o) => !o)
        }}
      >
        {trigger}
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: pos.top, left: pos.left, right: pos.right }}
            onClick={(e) => e.stopPropagation()}
            className="z-50 min-w-44 animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-popover"
          >
            {items.map((item, i) => (
              <button
                key={i}
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:opacity-50',
                  item.destructive
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-700 hover:bg-slate-100',
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
