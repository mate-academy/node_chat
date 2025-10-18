# Node Chat

Chat full-stack com salas, histórico e tempo real.

## Como rodar
- **Tudo junto**: `npm run start:all`
- Ou separado:
  - Backend: `npm run server` (porta 3000)
  - Frontend: `npm run dev` (Vite, porta 5173)

> Proxy do Vite já configurado: `/api` → http://localhost:3000 e `/ws` → ws://localhost:3000

## Funcionalidades
- Username enviado a `/auth/login` e salvo em `localStorage`.
- Salas: criar / renomear / excluir / selecionar.
- Histórico por sala: `GET /rooms/:id/messages`.
- Tempo real: **WebSocket**, **SSE** e **Long Polling** (seletor no topo direito).

## Build e preview
```bash
npm run build
npm run preview
