import type { Meta, StoryObj } from '@storybook/react'
import { DeliveriesTable } from './DeliveriesTable'

const meta: Meta<typeof DeliveriesTable> = {
  title: 'Integrations/DeliveriesTable',
  component: DeliveriesTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: { component: 'Últimos webhooks recebidos da Botyio. Mostra eventos do contrato.' },
    },
  },
}
export default meta
type Story = StoryObj<typeof DeliveriesTable>

export const Vazio: Story = {
  args: { rows: [], isLoading: false },
}

export const Carregando: Story = {
  args: { rows: [], isLoading: true },
}

export const ComEntregas: Story = {
  args: {
    isLoading: false,
    rows: [
      {
        id: 'cl_a',
        deliveryId: 'del_2026May06_4f3a8b7c0019',
        event: 'lead.registered',
        receivedAt: '2026-05-06T18:30:00Z',
      },
      {
        id: 'cl_b',
        deliveryId: 'del_2026May06_4f3a8b7c0020',
        event: 'whatsapp.sent',
        receivedAt: '2026-05-06T18:30:33Z',
      },
      {
        id: 'cl_c',
        deliveryId: 'del_2026May06_4f3a8b7c0021',
        event: 'whatsapp.delivered',
        receivedAt: '2026-05-06T18:31:01Z',
      },
      {
        id: 'cl_d',
        deliveryId: 'del_2026May06_4f3a8b7c0022',
        event: 'whatsapp.failed',
        receivedAt: '2026-05-06T18:31:30Z',
      },
    ],
  },
}
