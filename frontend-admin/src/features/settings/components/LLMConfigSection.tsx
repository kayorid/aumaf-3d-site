import { useState } from 'react'
import type { SecretFieldDto } from '@aumaf/shared'
import { toast } from 'sonner'
import { Save, Sparkles, Zap, ShieldCheck, AlertTriangle } from 'lucide-react'
import type { AIProviderName, LLMProviderConfigDto, UpdateLLMConfigInput } from '@aumaf/shared'
import {
  useLLMConfig,
  useUpdateLLMConfig,
  useTestLLM,
} from '@/features/integrations/api/use-llm-config'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

const PROVIDER_LABELS: Record<AIProviderName, string> = {
  openai: 'OpenAI · GPT',
  anthropic: 'Anthropic · Claude',
  gemini: 'Google · Gemini',
}

const PROVIDER_PLACEHOLDERS: Record<AIProviderName, { key: string; model: string }> = {
  openai: { key: 'sk-proj-...', model: 'gpt-4o-mini' },
  anthropic: { key: 'sk-ant-...', model: 'claude-sonnet-4-6' },
  gemini: { key: 'AIza...', model: 'gemini-2.0-flash-exp' },
}

interface FormState {
  defaultProvider: AIProviderName
  openaiApiKey: string
  openaiModel: string
  anthropicApiKey: string
  anthropicModel: string
  geminiApiKey: string
  geminiModel: string
}

export function LLMConfigSection() {
  const { data: config, isLoading } = useLLMConfig()
  const update = useUpdateLLMConfig()
  const test = useTestLLM()
  const [form, setForm] = useState<FormState | null>(null)
  const [testResult, setTestResult] = useState<Record<AIProviderName, { ok: boolean; message: string; latencyMs: number } | null>>({
    openai: null,
    anthropic: null,
    gemini: null,
  })

  if (isLoading || !config) return <LoadingScreen />

  const current: FormState = form ?? {
    defaultProvider: config.defaultProvider,
    openaiApiKey: '',
    openaiModel: config.providers.find((p) => p.provider === 'openai')?.model ?? '',
    anthropicApiKey: '',
    anthropicModel: config.providers.find((p) => p.provider === 'anthropic')?.model ?? '',
    geminiApiKey: '',
    geminiModel: config.providers.find((p) => p.provider === 'gemini')?.model ?? '',
  }

  const isDirty =
    current.defaultProvider !== config.defaultProvider ||
    current.openaiApiKey !== '' ||
    current.anthropicApiKey !== '' ||
    current.geminiApiKey !== '' ||
    current.openaiModel !== (config.providers.find((p) => p.provider === 'openai')?.model ?? '') ||
    current.anthropicModel !==
      (config.providers.find((p) => p.provider === 'anthropic')?.model ?? '') ||
    current.geminiModel !== (config.providers.find((p) => p.provider === 'gemini')?.model ?? '')

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...(prev ?? current), [k]: v }))

  async function handleSave() {
    const payload: UpdateLLMConfigInput = {}
    if (current.defaultProvider !== config!.defaultProvider) payload.defaultProvider = current.defaultProvider
    if (current.openaiApiKey) payload.openaiApiKey = current.openaiApiKey
    if (current.openaiModel) payload.openaiModel = current.openaiModel
    if (current.anthropicApiKey) payload.anthropicApiKey = current.anthropicApiKey
    if (current.anthropicModel) payload.anthropicModel = current.anthropicModel
    if (current.geminiApiKey) payload.geminiApiKey = current.geminiApiKey
    if (current.geminiModel) payload.geminiModel = current.geminiModel

    if (Object.keys(payload).length === 0) {
      toast.info('Nenhuma alteração para salvar.')
      return
    }
    try {
      await update.mutateAsync(payload)
      toast.success('Credenciais de LLM atualizadas.')
      setForm((prev) =>
        prev
          ? { ...prev, openaiApiKey: '', anthropicApiKey: '', geminiApiKey: '' }
          : prev,
      )
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar.')
    }
  }

  async function handleTest(provider: AIProviderName) {
    const apiKey =
      provider === 'openai' ? current.openaiApiKey
      : provider === 'anthropic' ? current.anthropicApiKey
      : current.geminiApiKey
    try {
      const result = await test.mutateAsync({ provider, apiKey: apiKey || undefined })
      setTestResult((prev) => ({ ...prev, [provider]: { ok: result.ok, message: result.message, latencyMs: result.latencyMs } }))
      if (result.ok) toast.success(`${PROVIDER_LABELS[provider]} OK (${result.latencyMs}ms)`)
      else toast.error(`${PROVIDER_LABELS[provider]} — ${result.message}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro no teste.')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <section className="bg-surface-low/60 border border-white/10 rounded-sm p-6 space-y-4">
        <header className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary-container" />
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-on-surface">Provedor padrão</h2>
        </header>
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="default-provider" className="block">
            Qual provedor usar quando o painel de IA não especifica
          </Label>
          <Select
            id="default-provider"
            value={current.defaultProvider}
            onChange={(e) => set('defaultProvider', e.target.value as AIProviderName)}
          >
            <option value="openai">{PROVIDER_LABELS.openai}</option>
            <option value="anthropic">{PROVIDER_LABELS.anthropic}</option>
            <option value="gemini">{PROVIDER_LABELS.gemini}</option>
          </Select>
          <p className="text-[10px] text-on-surface-variant/70">
            Usado quando o redator escolhe "Padrão (env)" no painel IA do editor de posts.
          </p>
        </div>
      </section>

      {(['openai', 'anthropic', 'gemini'] as const).map((p) => {
        const provider = config.providers.find((x) => x.provider === p) as LLMProviderConfigDto
        const result = testResult[p]
        return (
          <section key={p} className="bg-surface-low/60 border border-white/10 rounded-sm p-6 space-y-5">
            <header className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary-container" />
                <h2 className="text-[11px] uppercase tracking-[0.2em] text-on-surface">
                  {PROVIDER_LABELS[p]}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[10px] uppercase tracking-[0.2em]',
                    provider.apiKey.isSet
                      ? 'border-primary-container/40 bg-primary-container/10 text-primary-container'
                      : provider.envFallback
                        ? 'border-warning/40 bg-warning/10 text-warning'
                        : 'border-white/15 bg-surface-dim text-on-surface-variant',
                  )}
                >
                  <span className={cn('size-1.5 rounded-full', provider.apiKey.isSet ? 'bg-primary-container dot-glow' : provider.envFallback ? 'bg-warning' : 'bg-on-surface-variant/40')} />
                  {provider.apiKey.isSet ? 'Configurado' : provider.envFallback ? 'Via ENV' : 'Não configurado'}
                </span>
              </div>
            </header>

            <ControlledSecret
              label={`API Key ${PROVIDER_LABELS[p]}`}
              info={provider.apiKey}
              placeholder={PROVIDER_PLACEHOLDERS[p].key}
              value={
                p === 'openai' ? current.openaiApiKey
                : p === 'anthropic' ? current.anthropicApiKey
                : current.geminiApiKey
              }
              onChange={(v) =>
                set(
                  p === 'openai' ? 'openaiApiKey' : p === 'anthropic' ? 'anthropicApiKey' : 'geminiApiKey',
                  v,
                )
              }
            />

            <div className="space-y-1.5">
              <Label htmlFor={`model-${p}`} className="block">Modelo padrão</Label>
              <Input
                id={`model-${p}`}
                placeholder={PROVIDER_PLACEHOLDERS[p].model}
                value={
                  p === 'openai' ? current.openaiModel
                  : p === 'anthropic' ? current.anthropicModel
                  : current.geminiModel
                }
                onChange={(e) =>
                  set(
                    p === 'openai' ? 'openaiModel' : p === 'anthropic' ? 'anthropicModel' : 'geminiModel',
                    e.target.value,
                  )
                }
              />
              <p className="text-[10px] text-on-surface-variant/70">
                Deixe vazio para usar o padrão do servidor ({PROVIDER_PLACEHOLDERS[p].model}).
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleTest(p)}
                disabled={test.isPending || (!provider.apiKey.isSet && !provider.envFallback && !(
                  p === 'openai' ? current.openaiApiKey
                  : p === 'anthropic' ? current.anthropicApiKey
                  : current.geminiApiKey
                ))}
              >
                <Zap className="size-3.5" />
                {test.isPending ? 'Testando…' : 'Testar conexão'}
              </Button>
              {result && (
                <span className={cn('text-[10px] uppercase tracking-[0.2em] flex items-center gap-1.5', result.ok ? 'text-primary-container' : 'text-error')}>
                  {!result.ok && <AlertTriangle className="size-3" />}
                  {result.ok ? `OK ${result.latencyMs}ms` : result.message.slice(0, 80)}
                </span>
              )}
            </div>
          </section>
        )
      })}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" disabled={!isDirty || update.isPending} onClick={handleSave} size="md">
          <Save className="size-3.5" />
          {update.isPending ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  )
}

function ControlledSecret({
  label,
  info,
  placeholder,
  value,
  onChange,
}: {
  label: string
  info: SecretFieldDto
  placeholder?: string
  value: string
  onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  const id = `llm-secret-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="block">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete="off"
          spellCheck={false}
          placeholder={info.isSet ? `Manter atual: ${info.masked}` : (placeholder ?? 'Cole a chave nova aqui')}
          className="pr-10 font-mono text-[12px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          aria-label={show ? 'Ocultar' : 'Mostrar'}
          onClick={() => setShow((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
          tabIndex={-1}
        >
          {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
      </div>
      <div className="text-[10px] text-on-surface-variant/70 space-y-0.5">
        {info.isSet ? (
          <>
            <p>Atual: <span className="font-mono text-on-surface-variant">{info.masked}</span></p>
            {info.updatedAt && (
              <p>
                Atualizado em {new Date(info.updatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                {info.updatedBy ? ` por ${info.updatedBy}` : ''}
              </p>
            )}
            <p className="text-[10px] text-on-surface-variant/60 italic">
              Deixe vazio para manter; preencha para substituir.
            </p>
          </>
        ) : (
          <p className="text-warning">Nenhuma chave configurada — preencha para ativar este provedor.</p>
        )}
      </div>
    </div>
  )
}
