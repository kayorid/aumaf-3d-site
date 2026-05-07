import type { Meta, StoryObj } from '@storybook/react'
import { CallbackUrlField } from './CallbackUrlField'

const meta: Meta<typeof CallbackUrlField> = {
  title: 'Integrations/CallbackUrlField',
  component: CallbackUrlField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Read-only — exibe a Callback URL pronta para colar no painel da Botyio. Derivada do BACKEND_URL no servidor; admin não edita.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof CallbackUrlField>

export const Homologacao: Story = {
  args: {
    url: 'https://api.aumaf.kayoridolfi.ai/api/v1/leads/botyio-status',
  },
}

export const Local: Story = {
  args: {
    url: 'http://localhost:3000/api/v1/leads/botyio-status',
  },
}
