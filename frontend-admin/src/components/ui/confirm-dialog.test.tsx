import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ConfirmProvider, useConfirm } from './confirm-dialog'

function Trigger({
  onResult,
  options,
}: {
  onResult: (v: boolean | string) => void
  options?: Parameters<ReturnType<typeof useConfirm>>[0]
}) {
  const confirm = useConfirm()
  return (
    <button
      onClick={async () => {
        try {
          const r = await confirm(options ?? { title: 'Tem certeza?', description: 'Detalhe' })
          onResult(r)
        } catch (e) {
          onResult((e as Error).message)
        }
      }}
    >
      ask
    </button>
  )
}

describe('<ConfirmProvider /> + useConfirm', () => {
  it('resolve true ao confirmar', async () => {
    let result: boolean | string | null = null
    render(
      <ConfirmProvider>
        <Trigger onResult={(v) => (result = v)} />
      </ConfirmProvider>,
    )
    await act(async () => {
      fireEvent.click(screen.getByText('ask'))
    })
    expect(screen.getByText('Tem certeza?')).toBeInTheDocument()
    expect(screen.getByText('Detalhe')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByText('Confirmar'))
    })
    expect(result).toBe(true)
  })

  it('resolve false ao cancelar', async () => {
    let result: boolean | string | null = null
    render(
      <ConfirmProvider>
        <Trigger onResult={(v) => (result = v)} />
      </ConfirmProvider>,
    )
    await act(async () => {
      fireEvent.click(screen.getByText('ask'))
    })
    await act(async () => {
      fireEvent.click(screen.getByText('Cancelar'))
    })
    expect(result).toBe(false)
  })

  it('hideCancel oculta o botão de cancelar (info-only modal)', async () => {
    render(
      <ConfirmProvider>
        <Trigger
          onResult={() => {}}
          options={{
            title: 'Aviso',
            description: 'Apenas leitura',
            hideCancel: true,
            confirmLabel: 'OK',
          }}
        />
      </ConfirmProvider>,
    )
    await act(async () => {
      fireEvent.click(screen.getByText('ask'))
    })
    expect(screen.getByText('OK')).toBeInTheDocument()
    expect(screen.queryByText('Cancelar')).not.toBeInTheDocument()
  })

  it('rejeita segunda chamada concorrente para evitar race', async () => {
    function DoubleTrigger({ onResult }: { onResult: (v: boolean | string) => void }) {
      const confirm = useConfirm()
      return (
        <button
          onClick={() => {
            confirm({ title: 'A', description: 'a' }).catch((e) =>
              onResult(`first:${(e as Error).message}`),
            )
            confirm({ title: 'B', description: 'b' }).catch((e) =>
              onResult(`second:${(e as Error).message}`),
            )
          }}
        >
          ask
        </button>
      )
    }
    let result: string | boolean | null = null
    render(
      <ConfirmProvider>
        <DoubleTrigger onResult={(v) => (result = v)} />
      </ConfirmProvider>,
    )
    await act(async () => {
      fireEvent.click(screen.getByText('ask'))
    })
    expect(typeof result).toBe('string')
    expect(result).toMatch(/^second:/)
  })
})
