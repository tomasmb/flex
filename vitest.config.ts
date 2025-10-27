import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
