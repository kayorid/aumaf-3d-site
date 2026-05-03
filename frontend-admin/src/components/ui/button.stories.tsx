import type { Meta, StoryObj } from '@storybook/react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'CTA primário do backoffice. Variantes seguem o Design System Cinematic Additive Manufacturing — verde neon `#61c54f` reservado para ações primárias e estados ativos. Uppercase + tracking [0.15em] por padrão.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    asChild: { control: false },
  },
  args: { variant: 'primary', size: 'md', children: 'Salvar alterações' },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {}

export const Secondary: Story = { args: { variant: 'secondary', children: 'Cancelar' } }

export const Ghost: Story = { args: { variant: 'ghost', children: 'Voltar' } }

export const Danger: Story = { args: { variant: 'danger', children: 'Excluir' } }

export const Outline: Story = { args: { variant: 'outline', children: 'Saber mais' } }

export const Loading: Story = { args: { loading: true, children: 'Publicando…' } }

export const Disabled: Story = { args: { disabled: true } }

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus />
        Novo post
      </>
    ),
  },
}

export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Pequeno</Button>
      <Button size="md">Médio</Button>
      <Button size="lg">Grande</Button>
      <Button size="icon" aria-label="Adicionar">
        <Plus />
      </Button>
    </div>
  ),
}

export const VariantsMatrix: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary"><Save /> Publicar</Button>
        <Button variant="secondary">Salvar rascunho</Button>
        <Button variant="ghost">Cancelar</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline">Configurar</Button>
        <Button variant="danger"><Trash2 /> Excluir</Button>
      </div>
    </div>
  ),
}
