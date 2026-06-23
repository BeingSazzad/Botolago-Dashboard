import { useRef } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

export interface ImageUploadProps {
  /** Current image (data URL or remote URL), or null/empty for none. */
  value?: string | null
  onChange: (value: string | null) => void
  label?: string
  hint?: string
  /** Preview shape: wide (16:9 cover), square (logo), circle (avatar). */
  variant?: 'wide' | 'square' | 'circle'
  /** Max file size in KB (default 512). */
  maxKB?: number
}

const previewClass: Record<NonNullable<ImageUploadProps['variant']>, string> = {
  wide: 'h-40 w-full rounded-xl',
  square: 'h-20 w-20 rounded-xl',
  circle: 'h-20 w-20 rounded-full',
}

/**
 * Reusable direct image uploader — reads a file to a data URL (no external URL
 * needed) and shows a live preview. Used for news covers, logos, player photos
 * and admin avatars.
 */
export function ImageUpload({ value, onChange, label, hint, variant = 'wide', maxKB = 512 }: ImageUploadProps) {
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'error', title: 'Invalid file', description: 'Please choose an image file.' })
      return
    }
    if (file.size > maxKB * 1024) {
      toast({ variant: 'error', title: 'Image too large', description: `Keep it under ${maxKB} KB.` })
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result))
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {label && <p className="mb-1.5 block text-sm font-medium text-slate-700">{label}</p>}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-50 text-slate-300',
            previewClass[variant],
            variant === 'wide' && 'w-40',
          )}
        >
          {value ? (
            <img src={value} alt={label ?? 'preview'} className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Upload className="h-4 w-4" />}
              onClick={() => inputRef.current?.click()}
            >
              {value ? 'Replace' : 'Upload image'}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:bg-rose-50"
                leftIcon={<X className="h-4 w-4" />}
                onClick={() => onChange(null)}
              >
                Remove
              </Button>
            )}
          </div>
          {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
      </div>
    </div>
  )
}
