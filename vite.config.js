import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

if (!process.env.BROWSER) {
  process.env.BROWSER = 'chrome';
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    globals: true,
    css: false,
  },
});
