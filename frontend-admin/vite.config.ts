import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@aumaf/shared': path.resolve(__dirname, '../packages/shared/src/index.ts'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
