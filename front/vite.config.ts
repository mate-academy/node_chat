// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   root: 'front', // Вказати корінь папки фронтенда
//   server: {
//     port: 5173,  // Ви можете змінити порт за потреби
//     // open: true,  // Автоматичне відкриття браузера при запуску
//     proxy: {
//       '/api': {
//         target: 'http://localhost:10000',  // Проксі для запитів до backend (припустимо, що бекенд працює на 3000 порту)
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, '')
//       }
//     }
//   },
//   build: {
//     outDir: '../dist', // Директорія для виходу
//     emptyOutDir: true,
//     rollupOptions: {
//       input: 'index.html', // Додайте явний шлях до index.html
//   },
//   },
// });

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'front',
  plugins: [react()],
})
