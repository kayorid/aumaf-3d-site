import type { Meta, StoryObj } from '@storybook/react'
import { BlockPreview } from './BlockPreview'
import { BLOCK_TEMPLATES } from './block-templates'

const meta: Meta<typeof BlockPreview> = {
  title: 'Editor/BlockPreview',
  component: BlockPreview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Renderiza, com estilos inline fiéis ao Design System Cinematic, o HTML de um bloco do editor. É o que o admin vê dentro do editor — espelho 1:1 do site público.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-black px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: { html: { control: 'text' } },
}

export default meta
type Story = StoryObj<typeof BlockPreview>

export const SpecsGrid: Story = {
  args: { html: BLOCK_TEMPLATES.find((t) => t.id === 'specs-grid')!.html },
}

export const MaterialCard: Story = {
  args: { html: BLOCK_TEMPLATES.find((t) => t.id === 'material-card')!.html },
}

export const ComparisonTable: Story = {
  args: { html: BLOCK_TEMPLATES.find((t) => t.id === 'comparison-table')!.html },
}

export const DecisionFlow: Story = {
  args: { html: BLOCK_TEMPLATES.find((t) => t.id === 'decision-flow')!.html },
}

export const AllTemplates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Todos os templates de bloco disponíveis no menu Inserir Bloco do editor, renderizados em sequência.',
      },
    },
  },
  render: () => (
    <div className="space-y-10">
      {BLOCK_TEMPLATES.map((tpl) => (
        <section key={tpl.id} className="space-y-3">
          <header className="flex items-center gap-3 text-on-surface-variant">
            <span className="text-2xl leading-none">{tpl.icon}</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{tpl.label}</span>
          </header>
          <BlockPreview html={tpl.html} />
        </section>
      ))}
    </div>
  ),
}
