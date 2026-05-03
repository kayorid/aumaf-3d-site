import type { Meta, StoryObj } from '@storybook/react'
import { Input, Textarea } from './input'
import { Label } from './label'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: { layout: 'padded' },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'url', 'number'] },
    disabled: { control: 'boolean' },
  },
  args: { placeholder: 'Digite aqui' },
}

export default meta
type Story = StoryObj<typeof Input>

export const Basic: Story = {}

export const WithLabel: Story = {
  render: () => (
    <div className="w-72 space-y-2">
      <Label htmlFor="title">Título do post</Label>
      <Input id="title" placeholder="Ex: Por que escolher PLA para protótipos" />
    </div>
  ),
}

export const Email: Story = { args: { type: 'email', placeholder: 'voce@empresa.com' } }

export const Password: Story = { args: { type: 'password', placeholder: '••••••••' } }

export const Disabled: Story = { args: { disabled: true, value: 'somente leitura' } }

export const TextareaStory: StoryObj<typeof Textarea> = {
  name: 'Textarea',
  render: () => (
    <div className="w-96 space-y-2">
      <Label htmlFor="msg">Mensagem</Label>
      <Textarea id="msg" placeholder="Cole o resumo do briefing aqui" />
    </div>
  ),
}

export const Form: Story = {
  render: () => (
    <form className="w-96 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="admin@aumaf.com.br" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pwd">Senha</Label>
        <Input id="pwd" type="password" placeholder="••••••••" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" placeholder="Conte um pouco sobre você" />
      </div>
    </form>
  ),
}
