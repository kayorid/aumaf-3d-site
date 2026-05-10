import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ConfirmProvider, useConfirm } from './confirm-dialog'
import { Button } from './button'

function DangerExample() {
  const confirm = useConfirm()
  const [last, setLast] = useState<string>('—')
  return (
    <div className="space-y-3">
      <Button
        variant="danger"
        onClick={async () => {
          const ok = await confirm({
            title: 'Excluir post',
            description: 'Esta ação não pode ser desfeita. Tem certeza?',
            confirmLabel: 'Excluir',
            variant: 'danger',
          })
          setLast(ok ? 'confirmado' : 'cancelado')
        }}
      >
        Pedir confirmação (danger)
      </Button>
      <p className="text-[11px] text-on-surface-variant">Última resposta: {last}</p>
    </div>
  )
}

function InfoExample() {
  const confirm = useConfirm()
  return (
    <Button
      variant="secondary"
      onClick={() =>
        confirm({
          title: 'Categoria com posts vinculados',
          description:
            'A categoria "Materiais" tem 12 posts vinculados. Reatribua antes de excluir.',
          confirmLabel: 'Entendi',
          variant: 'primary',
          hideCancel: true,
        })
      }
    >
      Modal info-only (hideCancel)
    </Button>
  )
}

const meta: Meta = {
  title: 'UI/ConfirmDialog',
  parameters: {
    docs: {
      description: {
        component:
          'Modal de confirmação reutilizável (Radix AlertDialog + DS Cinematic). Substitui `window.confirm` e `alert()` nativos. Hook imperativo `useConfirm()` retorna `Promise<boolean>`. Suporta variant `danger` (default) ou `primary`, e `hideCancel` para modais info-only. Race-safe: rejeita segunda chamada concorrente.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ConfirmProvider>
        <Story />
      </ConfirmProvider>
    ),
  ],
}
export default meta

type Story = StoryObj
export const Danger: Story = { render: () => <DangerExample /> }
export const InfoOnly: Story = { render: () => <InfoExample /> }
