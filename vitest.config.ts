import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    include: [
      'src/lib/server/**/__tests__/**.{test,spec}.{js,ts}',
      'src/components/**/__tests__/**/*.{test,spec}.{jsx,tsx}',
    ],
    setupFiles: ['./vitest.setup.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})