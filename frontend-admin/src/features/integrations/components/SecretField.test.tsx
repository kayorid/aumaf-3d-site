import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SecretField } from './SecretField'

describe('<SecretField />', () => {
  it('mostra placeholder "manter atual" quando isSet=true', () => {
    render(
      <SecretField
        label="API Key"
        masked="••••abcd"
        isSet
        updatedAt="2026-05-06T10:00:00Z"
        updatedBy="admin@aumaf.com.br"
      />,
    )
    const input = screen.getByLabelText('API Key') as HTMLInputElement
    expect(input.placeholder).toMatch(/Manter atual/i)
    expect(input.placeholder).toContain('••••abcd')
    expect(input.type).toBe('password')
    expect(screen.getByText(/Atualizado em/)).toBeTruthy()
  })

  it('quando isSet=false avisa que não há credencial', () => {
    render(<SecretField label="Webhook Secret" masked="" isSet={false} />)
    expect(screen.getByText(/Nenhuma credencial configurada/i)).toBeTruthy()
  })

  it('botão olho alterna apenas a visibilidade do que o usuário digita', () => {
    render(<SecretField label="API Key" masked="••••abcd" isSet />)
    const input = screen.getByLabelText('API Key') as HTMLInputElement
    expect(input.type).toBe('password')
    fireEvent.click(screen.getByLabelText(/Mostrar valor digitado/i))
    expect(input.type).toBe('text')
    fireEvent.click(screen.getByLabelText(/Ocultar valor digitado/i))
    expect(input.type).toBe('password')
  })

  it('NUNCA renderiza o valor cru salvo (apenas a máscara)', () => {
    render(<SecretField label="API Key" masked="••••abcd" isSet updatedAt={null} updatedBy={null} />)
    const text = screen.getByText('••••abcd')
    expect(text).toBeTruthy()
    // Nenhuma string que pareça plaintext de chave Botyio:
    expect(screen.queryByText(/bty_lds_[a-zA-Z0-9]+/)).toBeNull()
  })
})
