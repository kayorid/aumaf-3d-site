import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BlockPreview } from './BlockPreview'
import { BLOCK_TEMPLATES } from './block-templates'

describe('<BlockPreview />', () => {
  it('renderiza Specs Grid com label esperado', () => {
    const tpl = BLOCK_TEMPLATES.find((t) => t.id === 'specs-grid')!
    const { container } = render(<BlockPreview html={tpl.html} />)
    expect(container.textContent).toContain('Dados do Projeto')
  })

  it('renderiza Material Card', () => {
    const tpl = BLOCK_TEMPLATES.find((t) => t.id === 'material-card')!
    const { container } = render(<BlockPreview html={tpl.html} />)
    expect(container.textContent).toContain('Nome do Material')
  })

  it('renderiza Tabela Comparativa', () => {
    const tpl = BLOCK_TEMPLATES.find((t) => t.id === 'comparison-table')!
    const { container } = render(<BlockPreview html={tpl.html} />)
    expect(container.textContent).toContain('Critério')
    expect(container.textContent).toContain('Opção A')
    expect(container.textContent).toContain('Opção B')
  })

  it('renderiza Decision Flow', () => {
    const tpl = BLOCK_TEMPLATES.find((t) => t.id === 'decision-flow')!
    const { container } = render(<BlockPreview html={tpl.html} />)
    expect(container.textContent).toMatch(/Pergunta de decisão/)
  })

  it('aceita HTML arbitrário', () => {
    const html = '<div><h2>Title</h2><p>Content</p></div>'
    const { container } = render(<BlockPreview html={html} />)
    expect(container.textContent).toContain('Title')
    expect(container.textContent).toContain('Content')
  })

  it('lida com HTML vazio sem crashar', () => {
    const { container } = render(<BlockPreview html="" />)
    expect(container).toBeTruthy()
  })
})
