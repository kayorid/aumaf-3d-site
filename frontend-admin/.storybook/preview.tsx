import React from 'react'
import type { Preview } from '@storybook/react'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date/i,
      },
      expanded: true,
    },
    backgrounds: {
      default: 'cinematic-deep',
      values: [
        { name: 'cinematic-deep', value: '#000000' },
        { name: 'cinematic-surface', value: '#131313' },
        { name: 'cinematic-elevated', value: '#1c1b1b' },
      ],
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-roles', enabled: true },
        ],
      },
      options: {},
    },
    docs: {
      toc: true,
      story: { inline: true },
    },
    options: {
      storySort: {
        order: ['Foundation', ['Tokens', 'Colors', 'Typography'], 'UI', 'Editor', 'Dashboard'],
      },
    },
  },
  decorators: [
    (Story) =>
      React.createElement(
        'div',
        {
          className:
            'font-sans bg-background text-text-primary min-h-[200px] p-6 antialiased selection:bg-primary/30',
        },
        React.createElement(Story),
      ),
  ],
  tags: ['autodocs'],
}

export default preview
