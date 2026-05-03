import type { Meta, StoryObj } from '@storybook/react'
import { FileText, Inbox, Sparkles, Send } from 'lucide-react'
import { KpiCard } from './KpiCard'

const meta: Meta<typeof KpiCard> = {
  title: 'Dashboard/KpiCard',
  component: KpiCard,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['neutral', 'primary', 'warn'] },
    loading: { control: 'boolean' },
  },
  args: {
    label: 'Posts publicados',
    value: 12,
    number: '01',
    icon: <FileText />,
    variant: 'primary',
    hint: '+3 nos últimos 30 dias',
  },
}

export default meta
type Story = StoryObj<typeof KpiCard>

export const Primary: Story = {}
export const Neutral: Story = { args: { variant: 'neutral', label: 'Rascunhos', value: 4, number: '02' } }
export const Warn: Story = {
  args: { variant: 'warn', label: 'Pendentes revisão', value: 1, number: '03', hint: 'Reveja antes do dia 15' },
}
export const Loading: Story = { args: { loading: true, value: '' } }

export const DashboardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Posts publicados" value={12} number="01" icon={<FileText />} variant="primary" hint="+3 (30d)" />
      <KpiCard label="Rascunhos" value={4} number="02" icon={<FileText />} variant="neutral" />
      <KpiCard label="Leads (30d)" value={47} number="03" icon={<Inbox />} variant="primary" hint="média 1.5/dia" />
      <KpiCard label="Posts via IA" value={8} number="04" icon={<Sparkles />} variant="warn" hint="67% do total" />
    </div>
  ),
}

export const StringValue: Story = {
  args: { label: 'Próximo deploy', value: 'segunda-feira', number: '05', icon: <Send />, variant: 'neutral' },
}
