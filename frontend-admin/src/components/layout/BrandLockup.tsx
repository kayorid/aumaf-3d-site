import { templateConfig } from '@template/shared'
import { cn } from '@/lib/utils'

/**
 * Lockup do nome da marca, particionado em duas partes:
 *   "AUMAF 3D"   -> "AUMAF" + "3D"
 *   "Acme Corp"  -> "Acme"  + "Corp"
 *   "Single"     -> "Single" + "" (só a primeira renderiza)
 *
 * A última palavra é destacada em primary-container.
 * Para marcas que não devem usar Pirulen, edite a face em `src/index.css`
 * ou troque a classe via prop `font`.
 */
export function BrandLockup({
  className,
  size = 14,
  font = 'font-pirulen',
}: {
  className?: string
  size?: number
  font?: string
}) {
  const parts = templateConfig.name.trim().split(/\s+/)
  const head = parts.slice(0, parts.length === 1 ? 1 : -1).join(' ')
  const tail = parts.length > 1 ? parts[parts.length - 1] : ''

  const sizeClass = `text-[${size}px]`
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className={cn(font, sizeClass, 'text-white tracking-[0.06em]')}>
        {head}
      </span>
      {tail && (
        <span className={cn(font, sizeClass, 'text-primary-container tracking-[0.06em]')}>
          {tail}
        </span>
      )}
    </div>
  )
}
