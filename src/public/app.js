'use strict';
/* global localStorage */

const API_BASE = '/api';
const STORAGE_KEY = 'chat_username';
let currentRoomId = null;

const usernameLabel = document.getElementById('usernameLabel');
const changeUsernameButton = document.getElementById('changeUsernameButton');
const roomForm = document.getElementById('roomForm');
const roomTitleInput = document.getElementById('roomTitleInput');
const roomList = document.getElementById('roomList');
const activeRoomTitle = document.getElementById('activeRoomTitle');
const roomSubtitle = document.getElementById('roomSubtitle');
const messagesContainer = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const messageText = document.getElementById('messageText');
const messageSubmit = messageForm.querySelector('button');

function getUsername() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

function setUsername(username) {
  localStorage.setItem(STORAGE_KEY, username);
  usernameLabel.textContent = username;
}

function askUsername() {
  const stored = getUsername();
  if (stored.trim()) {
    setUsername(stored.trim());
    return stored.trim();
  }

  const username = window.prompt('Enter your username', 'Guest');
  if (!username || !username.trim()) {
    return askUsername();
  }

  setUsername(username.trim());
  return username.trim();
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderRooms(rooms) {
  roomList.innerHTML = '';

  if (!rooms.length) {
    const placeholder = document.createElement('li');
    placeholder.textContent = 'No rooms yet. Create one above.';
    placeholder.className = 'room-item';
    roomList.appendChild(placeholder);
    return;
  }

  rooms.forEach((room) => {
    const roomItem = document.createElement('li');
    roomItem.className = `room-item${room.id === currentRoomId ? ' active' : ''}`;

    const title = document.createElement('button');
    title.type = 'button';
    title.textContent = room.title;
    title.addEventListener('click', () => joinRoom(room.id));
    roomItem.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'room-actions';

    const renameButton = document.createElement('button');
    renameButton.type = 'button';
    renameButton.textContent = 'Rename';
    renameButton.addEventListener('click', () => renameRoom(room));
    actions.appendChild(renameButton);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.style.background = 'linear-gradient(135deg, var(--danger), #c74d53)';
    deleteButton.addEventListener('click', () => deleteRoom(room));
    actions.appendChild(deleteButton);

    roomItem.appendChild(actions);
    roomList.appendChild(roomItem);
  });
}

function renderMessages(messages) {
  messagesContainer.innerHTML = '';
  if (!messages.length) {
    const empty = document.createElement('div');
    empty.className = 'message';
    empty.textContent = 'This room is empty. Send the first message.';
    messagesContainer.appendChild(empty);
    return;
  }

  messages.forEach((message) => {
    const messageElement = document.createElement('article');
    messageElement.className = 'message';

    const header = document.createElement('div');
    header.className = 'message-header';

    const author = document.createElement('span');
    author.textContent = message.author;
    header.appendChild(author);

    const timestamp = document.createElement('span');
    timestamp.textContent = formatTime(message.createdAt);
    header.appendChild(timestamp);

    const text = document.createElement('div');
    text.className = 'message-text';
    text.textContent = message.text;

    messageElement.appendChild(header);
    messageElement.appendChild(text);
    messagesContainer.appendChild(messageElement);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Request failed');
  }

  return response.json();
}

async function loadRooms() {
  const rooms = await request(`${API_BASE}/rooms`);
  renderRooms(rooms);
  if (!currentRoomId && rooms.length) {
    joinRoom(rooms[0].id);
  }
}

async function loadMessages(roomId) {
  if (!roomId) {
    renderMessages([]);
    return;
  }

  const messages = await request(`${API_BASE}/rooms/${roomId}/messages`);
  renderMessages(messages);
}

async function joinRoom(roomId) {
  currentRoomId = roomId;
  updateRoomState();
  await loadRooms();
  await loadMessages(roomId);
}

function updateRoomState() {
  const roomTitle = roomList.querySelector('.room-item.active button');
  activeRoomTitle.textContent = roomTitle ? roomTitle.textContent : 'Pick a room';
  roomSubtitle.textContent = currentRoomId ? 'Messages appear below.' : 'Join a room to see messages.';
  messageText.disabled = !currentRoomId;
  messageSubmit.disabled = !currentRoomId;
}

async function addRoom(title) {
  const trimmed = title.trim();
  if (!trimmed) return;
  await request(`${API_BASE}/rooms`, {
    method: 'POST',
    body: JSON.stringify({ title: trimmed }),
  });
  roomTitleInput.value = '';
  await loadRooms();
}

async function renameRoom(room) {
  const nextTitle = window.prompt('Room name', room.title);
  if (!nextTitle || !nextTitle.trim() || nextTitle.trim() === room.title) {
    return;
  }

  await request(`${API_BASE}/rooms/${room.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title: nextTitle.trim() }),
  });
  await loadRooms();
}

async function deleteRoom(room) {
  if (!window.confirm(`Delete room "${room.title}"?`)) {
    return;
  }

  await request(`${API_BASE}/rooms/${room.id}`, {
    method: 'DELETE',
  });

  if (currentRoomId === room.id) {
    currentRoomId = null;
    updateRoomState();
  }

  await loadRooms();
  if (currentRoomId) {
    await loadMessages(currentRoomId);
  }
}

async function sendMessage(text) {
  await request(`${API_BASE}/rooms/${currentRoomId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text, author: getUsername() }),
  });
  await loadMessages(currentRoomId);
}

roomForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await addRoom(roomTitleInput.value);
});

messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = messageText.value.trim();
  if (!text || !currentRoomId) {
    return;
  }

  await sendMessage(text);
  messageText.value = '';
});

changeUsernameButton.addEventListener('click', () => {
  const username = window.prompt('Enter new username', getUsername());
  if (username && username.trim()) {
    setUsername(username.trim());
  }
});

window.addEventListener('load', async () => {
  askUsername();
  updateRoomState();
  await loadRooms();
});
