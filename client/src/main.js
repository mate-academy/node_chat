/* global io */
import { initAuth } from './modules/auth.js';
import { initRooms } from './modules/rooms.js';
import { initChat } from './modules/chat.js';

// eslint-disable-next-line no-console
const socket = io();

// Ініціалізуємо авторизацію після успішного підключення сокета
initChat(socket);
initRooms(socket);
initAuth(socket);

socket.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log(`✅ З'єднання встановлено! Мій ID: ${socket.id}`);
});
