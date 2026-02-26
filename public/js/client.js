'use strict';

/* eslint-disable no-undef */
const socket = io();

// DOM Elements
const usernameModal = document.getElementById('usernameModal');
const usernameForm = document.getElementById('usernameForm');
const usernameInput = document.getElementById('usernameInput');
const chatApp = document.getElementById('chatApp');
const currentUserEl = document.getElementById('currentUser');

const roomList = document.getElementById('roomList');
const createRoomBtn = document.getElementById('createRoomBtn');
const roomNameEl = document.getElementById('roomName');
const renameRoomBtn = document.getElementById('renameRoomBtn');
const deleteRoomBtn = document.getElementById('deleteRoomBtn');

const messagesContainer = document.getElementById('messagesContainer');
const messagesList = document.getElementById('messagesList');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

// State
let username = localStorage.getItem('username');
let currentRoomId = null;
const DEFAULT_ROOM_ID = 'general';

// ===== Username Handling =====
function initUsername() {
  if (username) {
    showChat();
  } else {
    usernameModal.classList.remove('hidden');
    chatApp.classList.add('hidden');
  }
}

function showChat() {
  usernameModal.classList.add('hidden');
  chatApp.classList.remove('hidden');
  currentUserEl.textContent = username;
  socket.emit('user:set', username);

  // Auto-join General room
  joinRoom(DEFAULT_ROOM_ID);
}

usernameForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = usernameInput.value.trim();

  if (name.length < 2) {
    return;
  }

  username = name;
  localStorage.setItem('username', username);
  showChat();
});

// ===== Room Handling =====
function renderRoomList(rooms) {
  roomList.innerHTML = '';

  rooms.forEach((room) => {
    const li = document.createElement('li');

    li.textContent = room.name;
    li.dataset.roomId = room.id;

    if (room.id === currentRoomId) {
      li.classList.add('active');
    }

    li.addEventListener('click', () => joinRoom(room.id));
    roomList.appendChild(li);
  });
}

function joinRoom(roomId) {
  currentRoomId = roomId;
  socket.emit('room:join', roomId);
  messageForm.classList.remove('hidden');
  messageInput.focus();

  // Update active state in sidebar
  document.querySelectorAll('.room-list li').forEach((li) => {
    li.classList.toggle('active', li.dataset.roomId === roomId);
  });

  // Show/hide room action buttons (hide for General)
  const isDefault = roomId === DEFAULT_ROOM_ID;

  renameRoomBtn.classList.toggle('hidden', isDefault);
  deleteRoomBtn.classList.toggle('hidden', isDefault);
}

createRoomBtn.addEventListener('click', () => {
  const name = prompt('Enter room name:');

  if (name && name.trim()) {
    socket.emit('room:create', name.trim());
  }
});

renameRoomBtn.addEventListener('click', () => {
  const newName = prompt('Enter new room name:');

  if (newName && newName.trim()) {
    socket.emit('room:rename', {
      roomId: currentRoomId,
      newName: newName.trim(),
    });
  }
});

deleteRoomBtn.addEventListener('click', () => {
  const confirmed = confirm(
    'Are you sure you want to delete this room? All messages will be lost.',
  );

  if (confirmed) {
    socket.emit('room:delete', currentRoomId);
  }
});

// ===== Message Handling =====
function formatTime(isoString) {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

function createMessageElement(message) {
  const div = document.createElement('div');

  div.classList.add('message');

  div.innerHTML = `
    <div class="message-header">
      <span class="message-author">${escapeHtml(message.author)}</span>
      <span class="message-time">${formatTime(message.time)}</span>
    </div>
    <div class="message-text">${escapeHtml(message.text)}</div>
  `;

  return div;
}

function createSystemMessage(text) {
  const div = document.createElement('div');

  div.classList.add('system-message');
  div.textContent = text;

  return div;
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');

  div.textContent = text;

  return div.innerHTML;
}

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

  socket.emit('message:send', { text });
  messageInput.value = '';
  messageInput.focus();
});

// ===== Socket Event Listeners =====

// Receive room list
socket.on('room:list', (rooms) => {
  renderRoomList(rooms);
});

// Receive message history when joining a room
socket.on('room:history', (data) => {
  const { roomId, messages } = data;

  if (roomId !== currentRoomId) {
    return;
  }

  // Update room name in header
  const roomItems = document.querySelectorAll('.room-list li');

  roomItems.forEach((li) => {
    if (li.dataset.roomId === roomId) {
      roomNameEl.textContent = li.textContent;
    }
  });

  messagesList.innerHTML = '';

  messages.forEach((msg) => {
    messagesList.appendChild(createMessageElement(msg));
  });

  scrollToBottom();
});

// Receive new message
socket.on('message:new', (data) => {
  const { roomId, message } = data;

  if (roomId !== currentRoomId) {
    return;
  }

  messagesList.appendChild(createMessageElement(message));
  scrollToBottom();
});

// Room created
socket.on('room:created', (room) => {
  joinRoom(room.id);
});

// Room renamed
socket.on('room:renamed', (room) => {
  if (room.id === currentRoomId) {
    roomNameEl.textContent = room.name;
  }
});

// Room deleted
socket.on('room:deleted', (data) => {
  if (data.roomId === currentRoomId) {
    currentRoomId = DEFAULT_ROOM_ID;
    joinRoom(DEFAULT_ROOM_ID);
  }
});

// User joined notification
socket.on('room:userJoined', (data) => {
  if (data.roomId === currentRoomId && data.username !== username) {
    messagesList.appendChild(
      createSystemMessage(`${data.username} joined the room`),
    );
    scrollToBottom();
  }
});

// User left notification
socket.on('room:userLeft', (data) => {
  if (data.roomId === currentRoomId) {
    messagesList.appendChild(
      createSystemMessage(`${data.username} left the room`),
    );
    scrollToBottom();
  }
});

// Error messages
socket.on('error:message', (msg) => {
  alert(msg);
});

// ===== Initialize =====
initUsername();
