import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface SecretFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> {
  label: string
  /** Máscara já formatada vinda do backend (ex: "••••abcd"). */
  masked: string
  /** Se já existe credencial salva. */
  isSet: boolean
  /** ISO date da última atualização. */
  updatedAt?: string | null
  /** Identificador (email ou id) de quem atualizou. */
  updatedBy?: string | null
  /** Mensagem de erro (zod) */
  error?: string
}

/**
 * Campo de credencial sensível.
 * - Quando vazio: "manter atual" (não envia para o backend).
 * - Quando preenchido: novo valor que substituirá o atual.
 * - Helper text mostra `masked` + última atualização.
 *
 * O olhinho NÃO revela o valor salvo (que o backend NUNCA envia em claro);
 * apenas mostra/esconde o que o usuário ESTÁ digitando agora.
 */
export const SecretField = forwardRef<HTMLInputElement, SecretFieldProps>(function SecretField(
  { label, masked, isSet, updatedAt, updatedBy, error, className, id, ...rest },
  ref,
) {
  const [showTyped, setShowTyped] = useState(false)
  const inputId = id ?? `secret-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative">
        <Input
          id={inputId}
          ref={ref}
          type={showTyped ? 'text' : 'password'}
          autoComplete="off"
          spellCheck={false}
          placeholder={isSet ? `Manter atual: ${masked}` : 'Cole o valor novo aqui'}
          aria-describedby={`${inputId}-help`}
          className={cn('pr-10 font-mono text-[12px]', className)}
          {...rest}
        />
        <button
          type="button"
          aria-label={showTyped ? 'Ocultar valor digitado' : 'Mostrar valor digitado'}
          onClick={() => setShowTyped((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
          tabIndex={-1}
        >
          {showTyped ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
      </div>
      <div id={`${inputId}-help`} className="text-[10px] text-on-surface-variant/70 space-y-0.5">
        {isSet ? (
          <>
            <p>
              Atual: <span className="font-mono text-on-surface-variant">{masked}</span>
            </p>
            {updatedAt && (
              <p>
                Atualizado em {new Date(updatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                {updatedBy ? ` por ${updatedBy}` : ''}
              </p>
            )}
            <p className="text-[10px] text-on-surface-variant/60 italic">
              Deixe vazio para manter; preencha para substituir. O valor salvo nunca é exibido.
            </p>
          </>
        ) : (
          <p className="text-warning">Nenhuma credencial configurada — preencha para ativar.</p>
        )}
      </div>
      {error && <p className="text-[11px] text-error">{error}</p>}
    </div>
  )
})
