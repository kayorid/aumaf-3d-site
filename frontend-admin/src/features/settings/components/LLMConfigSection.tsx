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
import { SelectStyled } from '@/components/ui/select-styled'
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

const CUSTOM_MODEL_VALUE = '__custom__'

const PROVIDER_MODELS: Record<AIProviderName, Array<{ value: string; label: string; hint?: string }>> = {
  openai: [
    { value: 'gpt-4o-mini', label: 'gpt-4o-mini', hint: 'rápido · barato (padrão)' },
    { value: 'gpt-4o', label: 'gpt-4o', hint: 'multimodal · qualidade' },
    { value: 'gpt-4.1', label: 'gpt-4.1', hint: 'flagship 2025' },
    { value: 'gpt-4.1-mini', label: 'gpt-4.1-mini', hint: 'flagship rápido' },
    { value: 'gpt-4-turbo', label: 'gpt-4-turbo' },
    { value: 'o3-mini', label: 'o3-mini', hint: 'reasoning · rápido' },
    { value: 'o1-mini', label: 'o1-mini', hint: 'reasoning' },
  ],
  anthropic: [
    { value: 'claude-opus-4-7', label: 'claude-opus-4-7', hint: 'flagship · 1M ctx' },
    { value: 'claude-sonnet-4-6', label: 'claude-sonnet-4-6', hint: 'recomendado (padrão)' },
    { value: 'claude-haiku-4-5', label: 'claude-haiku-4-5', hint: 'rápido · barato' },
    { value: 'claude-opus-4-6', label: 'claude-opus-4-6' },
    { value: 'claude-3-5-sonnet-20241022', label: 'claude-3-5-sonnet-20241022', hint: 'legacy' },
  ],
  gemini: [
    { value: 'gemini-2.0-flash-exp', label: 'gemini-2.0-flash-exp', hint: 'recomendado (padrão)' },
    { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro', hint: 'qualidade' },
    { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash', hint: 'rápido' },
    { value: 'gemini-1.0-pro', label: 'gemini-1.0-pro', hint: 'legacy' },
  ],
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
          <SelectStyled<AIProviderName>
            id="default-provider"
            value={current.defaultProvider}
            onValueChange={(v) => set('defaultProvider', v)}
            options={[
              { value: 'openai', label: PROVIDER_LABELS.openai },
              { value: 'anthropic', label: PROVIDER_LABELS.anthropic },
              { value: 'gemini', label: PROVIDER_LABELS.gemini },
            ]}
          />
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

            <ModelPicker
              provider={p}
              value={
                p === 'openai' ? current.openaiModel
                : p === 'anthropic' ? current.anthropicModel
                : current.geminiModel
              }
              onChange={(v) =>
                set(
                  p === 'openai' ? 'openaiModel' : p === 'anthropic' ? 'anthropicModel' : 'geminiModel',
                  v,
                )
              }
            />

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

function ModelPicker({
  provider,
  value,
  onChange,
}: {
  provider: AIProviderName
  value: string
  onChange: (v: string) => void
}) {
  const models = PROVIDER_MODELS[provider]
  const known = models.some((m) => m.value === value)
  const [customMode, setCustomMode] = useState(value !== '' && !known)
  const selectValue = customMode ? CUSTOM_MODEL_VALUE : value || ''
  const placeholder = PROVIDER_PLACEHOLDERS[provider].model

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`model-${provider}`} className="block">
        Modelo padrão
      </Label>
      <SelectStyled<string>
        id={`model-${provider}`}
        value={selectValue}
        placeholder={`Padrão do servidor (${placeholder})`}
        onValueChange={(v) => {
          if (v === CUSTOM_MODEL_VALUE) {
            setCustomMode(true)
            onChange('')
          } else {
            setCustomMode(false)
            onChange(v)
          }
        }}
        options={[
          ...models.map((m) => ({
            value: m.value,
            label: (
              <span className="flex flex-col gap-0.5">
                <span className="font-mono text-[12px]">{m.label}</span>
                {m.hint && (
                  <span className="text-[10px] text-on-surface-variant/70 normal-case">
                    {m.hint}
                  </span>
                )}
              </span>
            ),
          })),
          {
            value: CUSTOM_MODEL_VALUE,
            label: (
              <span className="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                Outro (digitar manualmente)
              </span>
            ),
          },
        ]}
      />
      {customMode && (
        <Input
          id={`model-${provider}-custom`}
          autoFocus
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-[12px]"
        />
      )}
      <p className="text-[10px] text-on-surface-variant/70">
        Deixe sem selecionar para usar o padrão do servidor ({placeholder}).
      </p>
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
