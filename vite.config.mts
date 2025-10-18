import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config (ESM). Mantemos o WS direto para 3000 e
// redirecionamos apenas chamadas HTTP que começam com /api.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // evita trocar a porta se 5173 estiver em uso
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // /api/xyz -> http://localhost:3000/xyz
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // (opcional) se, no futuro, quiser chamar LP/SSE via /api
      '/lp': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/sse': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Não proxiar /ws: o front já usa ws://localhost:3000/ws diretamente
    },
  },
});
