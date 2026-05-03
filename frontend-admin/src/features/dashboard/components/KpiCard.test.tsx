import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FileText } from 'lucide-react'
import { KpiCard } from './KpiCard'

describe('<KpiCard />', () => {
  it('renderiza label, value, number', () => {
    render(<KpiCard label="Posts publicados" value={12} number="01" icon={<FileText data-testid="icon" />} />)
    expect(screen.getByText('Posts publicados')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('/ 01')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('mostra hint quando informado', () => {
    render(<KpiCard label="L" value={1} number="02" icon={null} hint="+3 últimos 30d" />)
    expect(screen.getByText('+3 últimos 30d')).toBeInTheDocument()
  })

  it('skeleton quando loading=true', () => {
    const { container } = render(<KpiCard label="L" value={0} number="03" icon={null} loading />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('0')).toBeNull()
  })

  it('aceita value como string', () => {
    render(<KpiCard label="Próximo deploy" value="segunda" number="04" icon={null} />)
    expect(screen.getByText('segunda')).toBeInTheDocument()
  })

  it('aplica variant primary corretamente nas classes', () => {
    const { container } = render(
      <KpiCard label="L" value={1} number="05" icon={null} variant="primary" />,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toMatch(/border-primary-container/)
  })
})
