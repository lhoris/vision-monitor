import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

const rootDir = import.meta.dirname

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/setup.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
      '@components': path.resolve(rootDir, './src/components'),
      '@pages': path.resolve(rootDir, './src/pages'),
      '@services': path.resolve(rootDir, './src/services'),
      '@types': path.resolve(rootDir, './src/types'),
      '@hooks': path.resolve(rootDir, './src/hooks'),
      '@store': path.resolve(rootDir, './src/store'),
    },
  },
})
