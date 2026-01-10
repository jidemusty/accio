import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.test.ts',
        'src/examples/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@connection': path.resolve(__dirname, './src/connection'),
      '@decorators': path.resolve(__dirname, './src/decorators'),
      '@repository': path.resolve(__dirname, './src/repository'),
      '@metadata': path.resolve(__dirname, './src/metadata'),
      '@query': path.resolve(__dirname, './src/query'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
});
