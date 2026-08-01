'use strict';

import { socket } from './socket.js';
import { state, setUsername } from './state.js';
import * as ui from './ui.js';

ui.els.loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const value = ui.els.usernameInput.value.trim();

  if (!value) {
    return;
  }

  setUsername(value);
  ui.showChat();
});

ui.els.createRoom.addEventListener('click', () => {
  const roomName = prompt('Room name:');

  if (roomName && roomName.trim()) {
    socket.emit('room:create', roomName.trim());
  }
});

ui.els.messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = ui.els.messageInput.value.trim();

  if (!text || state.activeRoomId === null) {
    return;
  }

  socket.emit('message:send', {
    roomId: state.activeRoomId,
    author: state.username,
    text,
  });

  ui.els.messageInput.value = '';
});

socket.on('rooms:list', (list) => {
  state.rooms = list;

  if (
    state.activeRoomId !== null &&
    !state.rooms.some((r) => r.id === state.activeRoomId)
  ) {
    ui.clearActiveRoom();
  }

  ui.renderRooms();
});

socket.on('room:history', ({ roomId, messages }) => {
  if (roomId !== state.activeRoomId) {
    return;
  }

  ui.els.messages.innerHTML = '';
  messages.forEach(ui.renderMessage);
});

socket.on('message:new', ({ roomId, message }) => {
  if (roomId === state.activeRoomId) {
    ui.renderMessage(message);
  }
});

if (state.username) {
  ui.showChat();
}
