import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { dismissToast, type Toast } from '@/store/uiSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { cn } from '@/lib/utils'

const config = {
  success: { icon: CheckCircle2, tone: 'text-emerald-600', ring: 'ring-emerald-100' },
  error: { icon: XCircle, tone: 'text-rose-600', ring: 'ring-rose-100' },
  info: { icon: Info, tone: 'text-primary-600', ring: 'ring-primary-100' },
}

function ToastCard({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch()
  const { icon: Icon, tone, ring } = config[toast.variant]

  useEffect(() => {
    const id = setTimeout(() => dispatch(dismissToast(toast.id)), 4000)
    return () => clearTimeout(id)
  }, [dispatch, toast.id])

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-80 animate-slide-in-right items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-popover ring-1',
        ring,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', tone)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-sm text-slate-500">{toast.description}</p>}
      </div>
      <button
        onClick={() => dispatch(dismissToast(toast.id))}
        className="text-slate-400 transition-colors hover:text-slate-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useAppSelector((s) => s.ui.toasts)
  if (toasts.length === 0) return null

  return createPortal(
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  )
}
