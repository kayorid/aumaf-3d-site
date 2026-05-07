import type { Meta, StoryObj } from '@storybook/react'
import { SecretField } from './SecretField'

const meta: Meta<typeof SecretField> = {
  title: 'Integrations/SecretField',
  component: SecretField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Campo de credencial sensível. Nunca exibe valor em claro; apenas máscara + última atualização. Vazio significa "manter atual"; preenchido significa "substituir".',
      },
    },
  },
  args: {
    label: 'API Key',
  },
}
export default meta
type Story = StoryObj<typeof SecretField>

export const NaoConfigurado: Story = {
  args: {
    masked: '',
    isSet: false,
    updatedAt: null,
    updatedBy: null,
  },
}

export const ConfiguradoComMetadata: Story = {
  args: {
    masked: '••••abcd',
    isSet: true,
    updatedAt: '2026-05-06T18:42:00Z',
    updatedBy: 'kayocdi@gmail.com',
  },
}

export const ComErroDeValidacao: Story = {
  args: {
    masked: '••••abcd',
    isSet: true,
    updatedAt: '2026-05-06T10:00:00Z',
    error: 'API key deve ter ao menos 8 caracteres',
  },
}
