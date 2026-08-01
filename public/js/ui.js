'use strict';

import { socket } from './socket.js';
import { state } from './state.js';

export const els = {
  login: document.getElementById('login'),
  loginForm: document.getElementById('login-form'),
  usernameInput: document.getElementById('username-input'),
  chat: document.getElementById('chat'),
  currentUser: document.getElementById('current-user'),
  rooms: document.getElementById('rooms'),
  createRoom: document.getElementById('create-room'),
  roomTitle: document.getElementById('room-title'),
  messages: document.getElementById('messages'),
  messageForm: document.getElementById('message-form'),
  messageInput: document.getElementById('message-input'),
};

export function showChat() {
  els.login.classList.add('hidden');
  els.chat.classList.remove('hidden');
  els.currentUser.textContent = state.username;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function joinRoom(roomId) {
  state.activeRoomId = roomId;

  const room = state.rooms.find((r) => r.id === roomId);

  els.roomTitle.textContent = room ? room.name : '';
  els.messages.innerHTML = '';
  els.messageForm.classList.remove('hidden');
  renderRooms();
  socket.emit('room:join', roomId);
}

export function clearActiveRoom() {
  state.activeRoomId = null;
  els.roomTitle.textContent = 'Select a room';
  els.messages.innerHTML = '';
  els.messageForm.classList.add('hidden');
}

export function renderRooms() {
  els.rooms.innerHTML = '';

  state.rooms.forEach((room) => {
    const li = document.createElement('li');

    li.className = 'room';

    if (room.id === state.activeRoomId) {
      li.classList.add('room--active');
    }

    const nameEl = document.createElement('span');

    nameEl.className = 'room__name';
    nameEl.textContent = room.name;
    nameEl.addEventListener('click', () => joinRoom(room.id));

    const actions = document.createElement('span');

    actions.className = 'room__actions';

    const renameBtn = document.createElement('button');

    renameBtn.textContent = '✎';
    renameBtn.title = 'Rename';

    renameBtn.addEventListener('click', () => {
      const value = prompt('New room name:', room.name);

      if (value && value.trim()) {
        socket.emit('room:rename', { roomId: room.id, name: value.trim() });
      }
    });

    const deleteBtn = document.createElement('button');

    deleteBtn.textContent = '🗑';
    deleteBtn.title = 'Delete';

    deleteBtn.addEventListener('click', () => {
      socket.emit('room:delete', room.id);
    });

    actions.append(renameBtn, deleteBtn);
    li.append(nameEl, actions);
    els.rooms.append(li);
  });
}

export function renderMessage(message) {
  const el = document.createElement('div');

  el.className = 'message';

  const meta = document.createElement('div');

  meta.className = 'message__meta';

  const author = document.createElement('span');

  author.className = 'message__author';
  author.textContent = message.author;

  meta.append(
    author,
    document.createTextNode(` · ${formatTime(message.time)}`),
  );

  const text = document.createElement('div');

  text.className = 'message__text';
  text.textContent = message.text;

  el.append(meta, text);
  els.messages.append(el);
  els.messages.scrollTop = els.messages.scrollHeight;
}
