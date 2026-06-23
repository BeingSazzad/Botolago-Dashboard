import { useCallback } from 'react'
import { pushToast, type Toast } from '@/store/uiSlice'
import { useAppDispatch } from '@/store/hooks'

/**
 * Flexible toast input — accepts either `variant`/`description` (canonical) or
 * the `type`/`message` aliases, so call sites can use whichever reads best.
 */
export interface ToastInput {
  title: string
  variant?: Toast['variant']
  type?: Toast['variant']
  description?: string
  message?: string
}

/** Fire toast notifications from anywhere. */
export function useToast() {
  const dispatch = useAppDispatch()

  return useCallback(
    (input: ToastInput) => {
      dispatch(
        pushToast({
          title: input.title,
          variant: input.variant ?? input.type ?? 'info',
          description: input.description ?? input.message,
        }),
      )
    },
    [dispatch],
  )
}
