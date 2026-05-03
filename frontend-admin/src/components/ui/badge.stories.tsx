import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          'Pílula de status. Sempre uppercase com tracking 0.2em. Verde só para `primary`/`success`/`active` — nunca em conteúdo neutro.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'primary', 'active', 'success', 'warn', 'info', 'danger'],
    },
  },
  args: { variant: 'neutral', children: 'rascunho' },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Neutral: Story = {}
export const Primary: Story = { args: { variant: 'primary', children: 'destaque' } }
export const Active: Story = { args: { variant: 'active', children: 'publicado' } }
export const Success: Story = { args: { variant: 'success', children: 'ok' } }
export const Warn: Story = { args: { variant: 'warn', children: 'atenção' } }
export const Info: Story = { args: { variant: 'info', children: 'info' } }
export const Danger: Story = { args: { variant: 'danger', children: 'erro' } }

export const StatusFlow: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="neutral">rascunho</Badge>
      <Badge variant="warn">revisão</Badge>
      <Badge variant="active">publicado</Badge>
      <Badge variant="info">agendado</Badge>
      <Badge variant="danger">erro</Badge>
    </div>
  ),
}
