import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SelectStyled } from './select-styled'
import { Label } from './label'

const meta: Meta<typeof SelectStyled> = {
  title: 'UI/SelectStyled',
  component: SelectStyled,
  parameters: {
    docs: {
      description: {
        component:
          'Select Radix com DS Cinematic aplicado. O label do item selecionado é renderizado via `<RSelect.ItemText>` para que apareça no trigger quando fechado (regressão corrigida em PR #33).',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof SelectStyled>

const PROVIDERS: Array<{ value: string; label: string }> = [
  { value: '__default__', label: 'Padrão da configuração' },
  { value: 'anthropic', label: 'Anthropic — Claude' },
  { value: 'openai', label: 'OpenAI — GPT' },
  { value: 'gemini', label: 'Google — Gemini' },
]

export const Default: Story = {
  render: () => {
    const [v, setV] = useState('__default__')
    return (
      <div className="w-[320px] space-y-2">
        <Label htmlFor="prov">Provedor</Label>
        <SelectStyled id="prov" value={v} onValueChange={setV} options={PROVIDERS} />
        <p className="text-[10px] text-on-surface-variant">value: {v}</p>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="w-[320px] space-y-2">
      <Label>Provedor (disabled)</Label>
      <SelectStyled value="anthropic" onValueChange={() => {}} options={PROVIDERS} disabled />
    </div>
  ),
}

export const ManyOptions: Story = {
  render: () => {
    const opts = Array.from({ length: 12 }, (_, i) => ({ value: `opt-${i}`, label: `Opção ${i + 1}` }))
    const [v, setV] = useState('opt-3')
    return (
      <div className="w-[320px] space-y-2">
        <Label>12 opções</Label>
        <SelectStyled value={v} onValueChange={setV} options={opts} />
      </div>
    )
  },
}
