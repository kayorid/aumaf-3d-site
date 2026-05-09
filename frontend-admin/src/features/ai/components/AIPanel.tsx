import { useEffect, useState } from 'react'
import { Sparkles, Loader2, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectStyled } from '@/components/ui/select-styled'
import { useGeneratePost } from '../api/use-generate-post'
import type { AIProviderName, AITone, GeneratePostOutput } from '@aumaf/shared'
import { cn } from '@/lib/utils'

interface Props {
  onApply: (output: GeneratePostOutput) => void
}

const TONE_OPTIONS: Array<{ value: AITone; label: string }> = [
  { value: 'didático', label: 'Didático' },
  { value: 'técnico', label: 'Técnico' },
  { value: 'comercial', label: 'Comercial' },
]

const DEFAULT_PROVIDER = '__default__'
type ProviderSelectValue = typeof DEFAULT_PROVIDER | AIProviderName
const PROVIDER_OPTIONS: Array<{ value: ProviderSelectValue; label: string }> = [
  { value: DEFAULT_PROVIDER, label: 'Padrão da configuração' },
  { value: 'anthropic', label: 'Anthropic — Claude' },
  { value: 'openai', label: 'OpenAI — GPT' },
  { value: 'gemini', label: 'Google — Gemini' },
]

export function AIPanel({ onApply }: Props) {
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [tone, setTone] = useState<AITone>('didático')
  const [targetWordCount, setTargetWordCount] = useState(1200)
  const [provider, setProvider] = useState<ProviderSelectValue>(DEFAULT_PROVIDER)
  const [elapsed, setElapsed] = useState(0)
  const generate = useGeneratePost()

  useEffect(() => {
    if (!generate.isPending) {
      setElapsed(0)
      return
    }
    const start = Date.now()
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500)
    return () => clearInterval(t)
  }, [generate.isPending])

  const handleGenerate = async () => {
    if (topic.trim().length < 5) return
    try {
      const result = await generate.mutateAsync({
        topic: topic.trim(),
        keywords: keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
          .slice(0, 10),
        tone,
        targetWordCount,
        provider: provider === DEFAULT_PROVIDER ? undefined : provider,
      })
      onApply(result)
    } catch {
      // tratado abaixo
    }
  }

  return (
    <Card className="space-y-4 border-primary-500/30">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-primary-400 flex items-center gap-2">
          <Sparkles className="size-3.5" />
          Assistente IA
        </h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai-provider">Provedor</Label>
        <SelectStyled<ProviderSelectValue>
          id="ai-provider"
          value={provider}
          onValueChange={(v) => setProvider(v)}
          options={PROVIDER_OPTIONS}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai-topic">Tema do post</Label>
        <Textarea
          id="ai-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder='ex: "Como escolher entre FDM e SLA para protótipos funcionais"'
          rows={3}
          maxLength={500}
        />
        <div className="text-[10px] text-text-tertiary text-right">{topic.length}/500</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai-keywords">Palavras-chave (separadas por vírgula)</Label>
        <Input
          id="ai-keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="impressão 3D, FDM, SLA, prototipagem"
        />
      </div>

      <div className="space-y-2">
        <Label>Tom</Label>
        <div className="grid grid-cols-3 gap-2">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTone(opt.value)}
              className={cn(
                'rounded-md border px-3 py-2 text-xs font-medium transition-colors',
                tone === opt.value
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-border bg-surface-100 text-text-secondary hover:bg-surface-200',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="ai-words">Tamanho alvo</Label>
          <span className="text-xs font-mono text-text-secondary tabular-nums">
            {targetWordCount} palavras
          </span>
        </div>
        <input
          id="ai-words"
          type="range"
          min={300}
          max={3000}
          step={100}
          value={targetWordCount}
          onChange={(e) => setTargetWordCount(Number(e.target.value))}
          className="w-full accent-primary-500"
        />
      </div>

      {generate.isError && (
        <div
          role="alert"
          className="rounded-md border border-danger-500/30 bg-danger-500/10 p-3 text-xs text-danger-400 flex items-start gap-2"
        >
          <X className="size-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Falha na geração</div>
            <div className="opacity-80 mt-0.5">{(generate.error as Error).message}</div>
          </div>
        </div>
      )}

      {generate.isPending && (
        <div className="rounded-md border border-primary-500/30 bg-primary-500/5 p-3 text-xs text-primary-400 flex items-center gap-2">
          <Loader2 className="size-4 animate-spin shrink-0" />
          <span>Gerando há {elapsed}s — pode levar até 90s.</span>
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={generate.isPending || topic.trim().length < 5}
        loading={generate.isPending}
        className="w-full"
      >
        <Sparkles className="size-4" />
        Gerar rascunho
      </Button>

      <p className="text-[10px] text-text-tertiary leading-relaxed">
        O rascunho é inserido no editor para revisão. Campos vazios (título, resumo, SEO) são
        preenchidos automaticamente; o conteúdo só é substituído com sua confirmação.
      </p>
    </Card>
  )
}
