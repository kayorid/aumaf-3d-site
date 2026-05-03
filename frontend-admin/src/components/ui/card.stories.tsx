import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof Card>

export const Basic: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Título do card</CardTitle>
        <Badge variant="active">publicado</Badge>
      </CardHeader>
      <CardContent>
        <CardDescription>
          Descrição neutra usada para subtítulos e textos secundários dentro do card.
        </CardDescription>
      </CardContent>
    </Card>
  ),
}

export const WithActions: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Configuração SEO</CardTitle>
        <Badge variant="warn">incompleto</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CardDescription>
            Faltam dados de Meta Description e palavras-chave para que o post seja indexado.
          </CardDescription>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm">
              Ignorar
            </Button>
            <Button size="sm">Configurar</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
}

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {['Posts publicados', 'Rascunhos', 'Leads (30d)'].map((title) => (
        <Card key={title}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-white">12</div>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
}
