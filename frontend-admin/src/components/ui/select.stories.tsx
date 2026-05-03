import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './select'
import { Label } from './label'

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: { layout: 'padded' },
  argTypes: { disabled: { control: 'boolean' } },
}

export default meta
type Story = StoryObj<typeof Select>

export const Basic: Story = {
  render: (args) => (
    <div className="w-72 space-y-2">
      <Label htmlFor="provider">Provedor de IA</Label>
      <Select id="provider" {...args}>
        <option value="anthropic">Anthropic — Claude</option>
        <option value="openai">OpenAI — GPT</option>
        <option value="gemini">Google — Gemini</option>
      </Select>
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="w-72">
      <Select {...args}>
        <option>Apenas leitura</option>
      </Select>
    </div>
  ),
}
