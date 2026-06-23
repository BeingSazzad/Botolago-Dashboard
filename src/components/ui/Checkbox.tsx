import { forwardRef, type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id ?? props.name
    return (
      <label htmlFor={checkboxId} className="inline-flex cursor-pointer items-center gap-2">
        <span className="relative inline-flex">
          <input ref={ref} id={checkboxId} type="checkbox" className="peer sr-only" {...props} />
          <span
            className={cn(
              'flex h-[18px] w-[18px] items-center justify-center rounded border border-slate-300 bg-white transition-colors',
              'peer-checked:border-primary-600 peer-checked:bg-primary-600',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40',
              // Tick is driven by the input's checked state (works for controlled + defaultChecked).
              '[&_svg]:opacity-0 peer-checked:[&_svg]:opacity-100',
              className,
            )}
          >
            <Check className="h-3 w-3 text-white transition-opacity" strokeWidth={3} />
          </span>
        </span>
        {label && <span className="text-sm text-slate-700">{label}</span>}
      </label>
    )
  },
)
Checkbox.displayName = 'Checkbox'
