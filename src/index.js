import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import { EVENTS } from './constants/events.js';
import { getAllRooms } from './rooms/roomsStore.js';
import { registerChatHandlers } from './socket/chatHandlers.js';

// eslint-disable-next-line no-shadow
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-shadow
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

const activeUsers = new Map();

app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
  // eslint-disable-next-line no-console
  console.log(`✅ Новий користувач підключився: ${socket.id}`);

  // Реєструємо обробники подій для кімнат та чату
  registerChatHandlers(io, socket, activeUsers);

  // Обробка події логіну
  socket.on(EVENTS.USER_LOGIN, (username) => {
    activeUsers.set(socket.id, username);
    // eslint-disable-next-line no-console
    console.log(`👤 Користувач ${username} авторизований під ID: ${socket.id}`);

    socket.emit(EVENTS.ROOMS_UPDATE, getAllRooms());
  });

  socket.on('disconnect', () => {
    const username = activeUsers.get(socket.id);

    activeUsers.delete(socket.id);

    // eslint-disable-next-line no-console
    console.log(
      `❌ Користувач ${username || 'Анонім'} (${socket.id}) відключився`,
    );
  });
});

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});
