import { useEffect, useState } from 'react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Save, Zap, ShieldCheck, RefreshCcw, MessagesSquare } from 'lucide-react'
import { UpdateBotyioConfigSchema, type UpdateBotyioConfigInput } from '@template/shared'
import {
  useBotyioConfig,
  useUpdateBotyioConfig,
  useTestBotyio,
  useBotyioDeliveries,
} from '../api/use-botyio-config'
import { SecretField } from '../components/SecretField'
import { CallbackUrlField } from '../components/CallbackUrlField'
import { DeliveriesTable } from '../components/DeliveriesTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

type FormShape = {
  enabled: boolean
  baseUrl: string
  apiKey: string
  webhookSecret: string
}

export function BotyioConfigPage() {
  const { data: config, isLoading } = useBotyioConfig()
  const update = useUpdateBotyioConfig()
  const test = useTestBotyio()
  const { data: deliveries, isLoading: deliveriesLoading, refetch: refetchDeliveries } = useBotyioDeliveries(10)

  const form = useForm<FormShape>({
    resolver: zodResolver(UpdateBotyioConfigSchema) as unknown as Resolver<FormShape>,
    defaultValues: { enabled: false, baseUrl: '', apiKey: '', webhookSecret: '' },
  })

  const [lastTest, setLastTest] = useState<{ ok: boolean; message: string; latencyMs: number } | null>(null)

  useEffect(() => {
    if (config) {
      form.reset({
        enabled: config.enabled,
        baseUrl: config.baseUrl,
        apiKey: '',
        webhookSecret: '',
      })
    }
  }, [config, form])

  const onSubmit = form.handleSubmit(async (values) => {
    // Construir payload apenas com o que mudou (apiKey/webhookSecret só se preenchidos)
    const payload: UpdateBotyioConfigInput = {}
    if (values.enabled !== config?.enabled) payload.enabled = values.enabled
    if (values.baseUrl && values.baseUrl !== config?.baseUrl) payload.baseUrl = values.baseUrl
    if (values.apiKey) payload.apiKey = values.apiKey
    if (values.webhookSecret) payload.webhookSecret = values.webhookSecret

    if (Object.keys(payload).length === 0) {
      toast.info('Nenhuma alteração para salvar.')
      return
    }

    try {
      await update.mutateAsync(payload)
      toast.success('Configuração da Botyio atualizada.')
      // limpa campos sensíveis após salvar
      form.setValue('apiKey', '')
      form.setValue('webhookSecret', '')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar.')
    }
  })

  async function handleTest() {
    try {
      const apiKeyTyped = form.getValues('apiKey')
      const baseUrlTyped = form.getValues('baseUrl')
      const result = await test.mutateAsync({
        apiKey: apiKeyTyped || undefined,
        baseUrl: baseUrlTyped || undefined,
      })
      setLastTest({ ok: result.ok, message: result.message, latencyMs: result.latencyMs })
      if (result.ok) {
        toast.success(`Conectado (${result.latencyMs}ms)`)
      } else {
        toast.error(`Falha: ${result.message}`)
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro no teste de conexão.')
    }
  }

  if (isLoading || !config) return <LoadingScreen />

  return (
    <div className="space-y-8 animate-fade-in max-w-[1100px]">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">/ 06</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Integrações · Botyio</span>
        </div>
        <h1 className="text-[clamp(28px,3vw,40px)] font-bold text-white uppercase leading-none tracking-[-0.03em]">
          Botyio <span className="text-gradient-green">WhatsApp.</span>
        </h1>
        <p className="text-[13px] text-on-surface-variant max-w-md leading-relaxed">
          Credenciais e estado da integração de captura de leads via WhatsApp. Os valores são criptografados em
          repouso e nunca exibidos em texto claro.
        </p>
      </header>

      {/* Status badge */}
      <div className="flex items-center gap-3 rounded-sm border border-white/10 bg-surface-low/40 px-4 py-3">
        <span
          className={cn(
            'size-2 rounded-full',
            config.enabled ? 'bg-primary-container dot-glow' : 'bg-on-surface-variant/40',
          )}
        />
        <div className="flex-1">
          <p className="text-[12px] uppercase tracking-[0.2em] text-on-surface">
            {config.enabled ? 'Ativada' : 'Desativada'}
          </p>
          <p className="text-[10px] text-on-surface-variant/70">
            API key: {config.apiKey.isSet ? 'configurada' : 'pendente'} · Webhook secret:{' '}
            {config.webhookSecret.isSet ? 'configurado' : 'pendente'}
          </p>
        </div>
        {lastTest && (
          <span
            className={cn(
              'text-[10px] uppercase tracking-[0.2em]',
              lastTest.ok ? 'text-primary-container' : 'text-error',
            )}
          >
            {lastTest.ok ? `OK ${lastTest.latencyMs}ms` : 'Erro'}
          </span>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Configuração */}
        <section className="bg-surface-low/60 border border-white/10 rounded-sm p-6 space-y-5">
          <header className="flex items-center gap-2 mb-2">
            <ShieldCheck className="size-4 text-primary-container" />
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-on-surface">Credenciais</h2>
          </header>

          <div className="space-y-3">
            <Label htmlFor="enabled-toggle" className="block">Estado da integração</Label>
            <Controller
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <button
                  id="enabled-toggle"
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  className={cn(
                    'inline-flex items-center gap-3 px-3 py-2 rounded-sm border transition-colors',
                    field.value
                      ? 'border-primary-container/40 bg-primary-container/10 text-primary-container'
                      : 'border-white/15 bg-surface-dim text-on-surface-variant',
                  )}
                >
                  <span
                    className={cn(
                      'size-1.5 rounded-full',
                      field.value ? 'bg-primary-container dot-glow' : 'bg-on-surface-variant/40',
                    )}
                  />
                  <span className="text-[11px] uppercase tracking-[0.2em]">
                    {field.value ? 'Botyio ATIVA' : 'Botyio DESATIVADA'}
                  </span>
                </button>
              )}
            />
            <p className="text-[10px] text-on-surface-variant/70">
              Quando desativada, os leads ainda são capturados no banco mas não são enviados para a Botyio.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="base-url">Base URL da API Botyio</Label>
            <Input id="base-url" {...form.register('baseUrl')} placeholder="https://api.botyio.com" />
            {form.formState.errors.baseUrl?.message && (
              <p className="text-[11px] text-error">{form.formState.errors.baseUrl.message}</p>
            )}
          </div>

          <SecretField
            label="API Key"
            masked={config.apiKey.masked}
            isSet={config.apiKey.isSet}
            updatedAt={config.apiKey.updatedAt}
            updatedBy={config.apiKey.updatedBy}
            error={form.formState.errors.apiKey?.message}
            {...form.register('apiKey')}
          />

          <SecretField
            label="Webhook Secret (HMAC-SHA256)"
            masked={config.webhookSecret.masked}
            isSet={config.webhookSecret.isSet}
            updatedAt={config.webhookSecret.updatedAt}
            updatedBy={config.webhookSecret.updatedBy}
            error={form.formState.errors.webhookSecret?.message}
            {...form.register('webhookSecret')}
          />
        </section>

        {/* Callback URL */}
        <section className="bg-surface-low/60 border border-white/10 rounded-sm p-6 space-y-4">
          <header className="flex items-center gap-2 mb-2">
            <MessagesSquare className="size-4 text-primary-container" />
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-on-surface">Webhook entrante</h2>
          </header>
          <CallbackUrlField url={config.callbackUrl} />
        </section>

        {/* Ações */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={test.isPending}
          >
            <Zap className="size-3.5" />
            {test.isPending ? 'Testando…' : 'Testar conexão'}
          </Button>

          <Button type="submit" size="md" disabled={!form.formState.isDirty || update.isPending}>
            <Save className="size-3.5" />
            {update.isPending ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </form>

      {/* Histórico de webhooks */}
      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-on-surface">Últimas entregas</h2>
          <button
            type="button"
            onClick={() => refetchDeliveries()}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary-container transition-colors"
          >
            <RefreshCcw className="size-3" /> recarregar
          </button>
        </header>
        <DeliveriesTable rows={deliveries ?? []} isLoading={deliveriesLoading} />
      </section>
    </div>
  )
}
