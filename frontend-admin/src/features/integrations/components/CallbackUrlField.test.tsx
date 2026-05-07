import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CallbackUrlField } from './CallbackUrlField'

describe('<CallbackUrlField />', () => {
  it('renderiza a URL como texto e botão de copiar', () => {
    render(<CallbackUrlField url="https://api.aumaf.kayoridolfi.ai/api/v1/leads/botyio-status" />)
    expect(screen.getByText('https://api.aumaf.kayoridolfi.ai/api/v1/leads/botyio-status')).toBeTruthy()
    expect(screen.getByLabelText(/Copiar URL/i)).toBeTruthy()
  })

  it('chama navigator.clipboard.writeText ao clicar em copiar', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<CallbackUrlField url="http://localhost:3000/api/v1/leads/botyio-status" />)
    fireEvent.click(screen.getByLabelText(/Copiar URL/i))

    expect(writeText).toHaveBeenCalledWith('http://localhost:3000/api/v1/leads/botyio-status')
  })
})
