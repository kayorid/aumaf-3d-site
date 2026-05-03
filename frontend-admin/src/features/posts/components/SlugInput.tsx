import slugify from 'slugify'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'

interface Props {
  title: string
  value: string
  onChange: (next: string) => void
  manualEdit: boolean
  onManualEditChange: (manual: boolean) => void
}

const SLUGIFY_OPTS = { lower: true, strict: true, trim: true, locale: 'pt' }

export function SlugInput({ title, value, onChange, manualEdit, onManualEditChange }: Props) {
  useEffect(() => {
    if (!manualEdit) {
      const next = slugify(title || '', SLUGIFY_OPTS)
      if (next !== value) onChange(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, manualEdit])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="post-slug">Slug</Label>
        {manualEdit ? (
          <button
            type="button"
            className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary hover:text-text-secondary"
            onClick={() => onManualEditChange(false)}
          >
            Re-gerar do título
          </button>
        ) : (
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            auto
          </span>
        )}
      </div>
      <Input
        id="post-slug"
        value={value}
        onChange={(e) => {
          onManualEditChange(true)
          onChange(slugify(e.target.value, SLUGIFY_OPTS))
        }}
        placeholder="meu-post-incrivel"
        className="font-mono text-xs"
      />
      <p className="text-[10px] text-text-tertiary">
        URL final: <span className="font-mono">/blog/{value || '...'}</span>
      </p>
    </div>
  )
}
