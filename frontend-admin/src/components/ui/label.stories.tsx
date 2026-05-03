import type { Meta, StoryObj } from '@storybook/react'
import { Label } from './label'
import { Input } from './input'

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof Label>

export const Basic: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Label htmlFor="x">Slug do post</Label>
      <Input id="x" placeholder="por-que-escolher-pla" />
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Label htmlFor="title">
        Título <span className="text-primary-container">*</span>
      </Label>
      <Input id="title" required placeholder="Obrigatório" />
    </div>
  ),
}
