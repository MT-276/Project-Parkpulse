import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 1147,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:1654',
        changeOrigin: true,
      },
    },
  },
});
