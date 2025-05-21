import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './vitest.setup.ts',
    alias: {
      '@': resolve(__dirname, './src'),
    },
    coverage: {
      reporter: ['text', 'html'],
      include: ['src'],
      exclude: ['**/*.d.ts', 'src/main.tsx'],
    },
    include: ['src/tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
