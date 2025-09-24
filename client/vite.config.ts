import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: __dirname,
  server: {
    proxy: {
      '/api': 'http://localhost:3005',
    },
  },
});