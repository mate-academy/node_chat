import { initializeAuth } from './auth.js';
import { initializeSocket } from './socket.js';
import { initializeUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const socket = window.io();

  const state = {
    socket,
    username: window.localStorage.getItem('chat_username'),
    currentRoomId: null,
  };

  initializeAuth(state);
  initializeSocket(state);
  initializeUI(state);
});
