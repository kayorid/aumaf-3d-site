/// <reference types="vitest" />
import { describe, it, expect } from 'vitest'
import { markdownToHtml, htmlToMarkdown } from './converters'

describe('markdownToHtml', () => {
  it('converte heading', () => {
    expect(markdownToHtml('## Título')).toContain('<h2>Título</h2>')
  })

  it('converte bold', () => {
    expect(markdownToHtml('Texto **negrito** aqui')).toContain('<strong>negrito</strong>')
  })

  it('converte italic sem capturar snake_case', () => {
    expect(markdownToHtml('a *itálico* b')).toContain('<em>itálico</em>')
    expect(markdownToHtml('snake_case_var')).not.toContain('<em>')
  })

  it('converte lista não ordenada', () => {
    const out = markdownToHtml('- a\n- b\n- c')
    expect(out).toContain('<ul>')
    expect(out).toContain('<li>')
  })

  it('converte task list para schema Tiptap', () => {
    const md = '- [x] feito\n- [ ] pendente'
    const out = markdownToHtml(md)
    expect(out).toContain('data-type="taskList"')
    expect(out).toContain('data-checked="true"')
    expect(out).toContain('data-checked="false"')
  })

  it('converte tabela GFM', () => {
    const md = '| a | b |\n| --- | --- |\n| 1 | 2 |'
    const out = markdownToHtml(md)
    expect(out).toContain('<table>')
    expect(out).toContain('<th>a</th>')
    expect(out).toContain('<td>1</td>')
  })

  it('preserva conteúdo de code block', () => {
    const md = '```js\nconst a = **not bold**\n```'
    const out = markdownToHtml(md)
    expect(out).toContain('<pre>')
    expect(out).toContain('class="language-js"')
    expect(out).toContain('**not bold**')
    expect(out).not.toContain('<strong>')
  })

  it('link com target blank e rel', () => {
    const out = markdownToHtml('[google](https://google.com)')
    expect(out).toContain('target="_blank"')
    expect(out).toContain('rel="noopener noreferrer nofollow"')
  })
})

describe('htmlToMarkdown (round-trip via DOM)', () => {
  // Vitest com jsdom necessário
  it('volta heading para markdown', () => {
    expect(htmlToMarkdown('<h2>X</h2>').trim()).toBe('## X')
  })

  it('volta bold + italic', () => {
    expect(htmlToMarkdown('<p>a <strong>b</strong> <em>c</em></p>').trim()).toBe('a **b** *c*')
  })

  it('volta lista', () => {
    const out = htmlToMarkdown('<ul><li>a</li><li>b</li></ul>')
    expect(out.trim()).toBe('- a\n- b')
  })

  it('volta task list', () => {
    const html =
      '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><div><p>feito</p></div></li><li data-type="taskItem" data-checked="false"><div><p>pendente</p></div></li></ul>'
    expect(htmlToMarkdown(html).trim()).toBe('- [x] feito\n- [ ] pendente')
  })

  it('volta tabela', () => {
    const html =
      '<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>'
    const out = htmlToMarkdown(html).trim()
    expect(out).toContain('| a | b |')
    expect(out).toContain('| --- | --- |')
    expect(out).toContain('| 1 | 2 |')
  })

  it('round-trip mantém estrutura', () => {
    const original = '## Seção\n\nTexto **negrito** e *itálico*.\n\n- a\n- b'
    const html = markdownToHtml(original)
    const back = htmlToMarkdown(html).trim()
    expect(back).toContain('## Seção')
    expect(back).toContain('**negrito**')
    expect(back).toContain('*itálico*')
    expect(back).toContain('- a')
    expect(back).toContain('- b')
  })
})
