import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    include: [
      'src/tests/tests-server/**.{test,spec}.{js,ts}',
       'src/tests/tests-server-actions/**.{test,spec}.{js,ts}',
      'src/tests/web/**/*.{test,spec}.{jsx,tsx}',
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