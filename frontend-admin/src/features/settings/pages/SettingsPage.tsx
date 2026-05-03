import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Save, BarChart3, Building2, Webhook } from 'lucide-react'
import { UpdateSettingsSchema, type UpdateSettingsInput } from '@aumaf/shared'
import { useSettings, useUpdateSettings } from '../api/use-settings'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

type Tab = 'geral' | 'analytics' | 'integracoes'

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'geral', label: 'Geral', icon: Building2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'integracoes', label: 'Integrações', icon: Webhook },
]

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const update = useUpdateSettings()
  const [tab, setTab] = useState<Tab>('geral')

  const form = useForm<UpdateSettingsInput>({
    resolver: zodResolver(UpdateSettingsSchema) as Resolver<UpdateSettingsInput>,
    mode: 'onChange',
  })

  useEffect(() => {
    if (settings) {
      form.reset({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription ?? undefined,
        contactEmail: settings.contactEmail ?? undefined,
        contactPhone: settings.contactPhone ?? undefined,
        whatsappNumber: settings.whatsappNumber ?? undefined,
        botyoWebhookUrl: settings.botyoWebhookUrl ?? undefined,
        ga4MeasurementId: settings.ga4MeasurementId ?? undefined,
        clarityProjectId: settings.clarityProjectId ?? undefined,
        facebookPixelId: settings.facebookPixelId ?? undefined,
        gtmContainerId: settings.gtmContainerId ?? undefined,
        customHeadScripts: settings.customHeadScripts ?? undefined,
        customBodyScripts: settings.customBodyScripts ?? undefined,
      })
    }
  }, [settings, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync(values)
      toast.success('Configurações atualizadas')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao salvar'
      toast.error(msg)
    }
  })

  if (isLoading) return <LoadingScreen />

  return (
    <div className="space-y-8 animate-fade-in max-w-[1200px]">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container">/ 05</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Configurações</span>
        </div>
        <h1 className="text-[clamp(28px,3vw,40px)] font-bold text-white uppercase leading-none tracking-[-0.03em]">
          Settings <span className="text-gradient-green">do site.</span>
        </h1>
        <p className="text-[13px] text-on-surface-variant max-w-md leading-relaxed">
          IDs de analytics, contato e integrações — refletem no público em até 60s.
        </p>
      </header>

      {/* Tabs */}
      <div role="tablist" className="flex gap-1 border-b border-white/10">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] transition-colors border-b-2 -mb-px',
                active
                  ? 'border-primary-container text-primary-container'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface',
              )}
            >
              <Icon className="size-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {tab === 'geral' && (
          <div className="bg-surface-low/60 border border-white/10 rounded-sm p-6 space-y-5 max-w-2xl">
            <Field label="Nome do site" error={form.formState.errors.siteName?.message}>
              <Input {...form.register('siteName')} />
            </Field>
            <Field label="Descrição do site" error={form.formState.errors.siteDescription?.message}>
              <Textarea rows={2} {...form.register('siteDescription')} />
            </Field>
            <Field label="E-mail de contato" error={form.formState.errors.contactEmail?.message}>
              <Input type="email" {...form.register('contactEmail')} />
            </Field>
            <Field label="Telefone" error={form.formState.errors.contactPhone?.message}>
              <Input {...form.register('contactPhone')} />
            </Field>
            <Field
              label="WhatsApp (formato +5516992863412)"
              error={form.formState.errors.whatsappNumber?.message}
            >
              <Input {...form.register('whatsappNumber')} placeholder="+5516992863412" />
            </Field>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="bg-surface-low/60 border border-white/10 rounded-sm p-6 space-y-5 max-w-2xl">
            <Field label="GA4 Measurement ID (G-XXXXXXXXXX)" error={form.formState.errors.ga4MeasurementId?.message}>
              <Input {...form.register('ga4MeasurementId')} placeholder="G-ABC123XY45" />
            </Field>
            <Field label="GTM Container ID (GTM-XXXXXX)" error={form.formState.errors.gtmContainerId?.message}>
              <Input {...form.register('gtmContainerId')} placeholder="GTM-ABC123" />
              <p className="text-[10px] text-on-surface-variant/70 mt-1">Se preenchido, GTM substitui GA4 standalone</p>
            </Field>
            <Field label="Microsoft Clarity ID" error={form.formState.errors.clarityProjectId?.message}>
              <Input {...form.register('clarityProjectId')} />
            </Field>
            <Field label="Facebook Pixel ID" error={form.formState.errors.facebookPixelId?.message}>
              <Input {...form.register('facebookPixelId')} />
            </Field>
            <Field label="Scripts custom (head)" error={form.formState.errors.customHeadScripts?.message}>
              <Textarea rows={4} className="font-mono text-[12px]" {...form.register('customHeadScripts')} />
              <p className="text-[10px] text-on-surface-variant/70 mt-1">HTML/JS injetado no &lt;head&gt;. Use com cuidado.</p>
            </Field>
            <Field label="Scripts custom (body)" error={form.formState.errors.customBodyScripts?.message}>
              <Textarea rows={4} className="font-mono text-[12px]" {...form.register('customBodyScripts')} />
            </Field>
          </div>
        )}

        {tab === 'integracoes' && (
          <div className="bg-surface-low/60 border border-white/10 rounded-sm p-6 space-y-5 max-w-2xl">
            <Field label="Webhook do Botyo (WhatsApp)" error={form.formState.errors.botyoWebhookUrl?.message}>
              <Input {...form.register('botyoWebhookUrl')} placeholder="https://botyo.com.br/webhook/..." />
            </Field>
            <p className="text-[11px] text-on-surface-variant/70">
              Mais integrações chegam em Phase 3.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {settings?.updatedAt && (
            <span className="text-[11px] text-on-surface-variant/70">
              Última atualização: {new Date(settings.updatedAt).toLocaleString('pt-BR')}
            </span>
          )}
          <Button type="submit" disabled={!form.formState.isDirty || update.isPending} size="md">
            <Save className="size-3.5" />
            {update.isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-[11px] text-error">{error}</p>}
    </div>
  )
}
