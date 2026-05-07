import { useState } from 'react'
import { Copy, Check, Webhook } from 'lucide-react'
import { Label } from '@/components/ui/label'

export interface CallbackUrlFieldProps {
  url: string
  label?: string
  helperText?: string
}

/**
 * Read-only — mostra a Callback URL que o admin precisa colar no painel Botyio.
 * Derivada do BACKEND_URL no servidor (R6); admin não pode editar.
 */
export function CallbackUrlField({
  url,
  label = 'Callback URL (configure no painel Botyio)',
  helperText = 'Cole esta URL no campo Callback URL do Source da Botyio. Quando o domínio mudar, atualize lá também.',
}: CallbackUrlFieldProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback silencioso (clipboard API pode falhar em http inseguro)
    }
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2 rounded-sm border border-white/15 bg-surface-dim px-3 py-2.5">
        <Webhook className="size-3.5 text-on-surface-variant shrink-0" />
        <code className="flex-1 text-[12px] font-mono text-on-surface break-all select-all">{url}</code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copiar URL"
          className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary-container transition-colors"
        >
          {copied ? (
            <>
              <Check className="size-3" /> copiado
            </>
          ) : (
            <>
              <Copy className="size-3" /> copiar
            </>
          )}
        </button>
      </div>
      <p className="text-[10px] text-on-surface-variant/70">{helperText}</p>
    </div>
  )
}
