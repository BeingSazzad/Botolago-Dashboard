import { forwardRef, type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, ...props }, ref) => {
    const checkboxId = id ?? props.name
    return (
      <label htmlFor={checkboxId} className="inline-flex cursor-pointer items-center gap-2">
        <span className="relative inline-flex">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <span
            className={cn(
              'flex h-[18px] w-[18px] items-center justify-center rounded border border-slate-300 bg-white transition-colors',
              'peer-checked:border-primary-600 peer-checked:bg-primary-600',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40',
              className,
            )}
          >
            <Check
              className={cn('h-3 w-3 text-white', checked ? 'opacity-100' : 'opacity-0')}
              strokeWidth={3}
            />
          </span>
        </span>
        {label && <span className="text-sm text-slate-700">{label}</span>}
      </label>
    )
  },
)
Checkbox.displayName = 'Checkbox'
