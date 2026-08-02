'use strict';

const USERNAME_STORAGE_KEY = 'chat:username';

const screens = {
  login: document.getElementById('login-screen'),
  rooms: document.getElementById('rooms-screen'),
  chat: document.getElementById('chat-screen'),
};

const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username-input');
const currentUsernameEl = document.getElementById('current-username');
const changeUsernameBtn = document.getElementById('change-username-btn');

const createRoomForm = document.getElementById('create-room-form');
const roomNameInput = document.getElementById('room-name-input');
const roomListEl = document.getElementById('room-list');

const leaveRoomBtn = document.getElementById('leave-room-btn');
const chatRoomNameEl = document.getElementById('chat-room-name');
const messageListEl = document.getElementById('message-list');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

const modalOverlay = document.getElementById('modal-overlay');
const modalMessage = document.getElementById('modal-message');
const modalInput = document.getElementById('modal-input');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const toast = document.getElementById('toast');

const socket = io();

let username = localStorage.getItem(USERNAME_STORAGE_KEY) || '';
let rooms = [];
let currentRoomId = null;

function showScreen(screenName) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle('hidden', key !== screenName);
  });
}

let modalResolve = null;

function closeModal(result) {
  modalOverlay.classList.add('hidden');

  if (modalResolve) {
    modalResolve(result);
    modalResolve = null;
  }
}

function openModal(message, showInput, inputValue) {
  modalMessage.textContent = message;
  modalInput.classList.toggle('hidden', !showInput);
  modalInput.value = showInput ? inputValue || '' : '';
  modalOverlay.classList.remove('hidden');

  if (showInput) {
    modalInput.focus();
    modalInput.select();
  }

  return new Promise((resolve) => {
    modalResolve = resolve;
  });
}

function showConfirm(message) {
  return openModal(message, false).then(Boolean);
}

function showPrompt(message, inputValue) {
  return openModal(message, true, inputValue).then((confirmed) => {
    return confirmed ? modalInput.value.trim() : null;
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

modalConfirmBtn.addEventListener('click', () => closeModal(true));
modalCancelBtn.addEventListener('click', () => closeModal(false));

modalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    closeModal(true);
  } else if (e.key === 'Escape') {
    closeModal(false);
  }
});

function joinAsUser(newUsername) {
  username = newUsername;
  localStorage.setItem(USERNAME_STORAGE_KEY, username);
  currentUsernameEl.textContent = username;
  socket.emit('user:join', username);
  showScreen('rooms');
}

function renderRoomList() {
  roomListEl.innerHTML = '';

  rooms.forEach((room) => {
    const item = document.createElement('li');

    item.className = 'room-item';

    const nameEl = document.createElement('span');

    nameEl.className = 'room-item-name';
    nameEl.textContent = room.name;
    nameEl.addEventListener('click', () => joinRoom(room.id));

    const actions = document.createElement('div');

    actions.className = 'room-item-actions';

    const renameBtn = document.createElement('button');

    renameBtn.type = 'button';
    renameBtn.className = 'icon-btn';
    renameBtn.textContent = 'Rename';
    renameBtn.addEventListener('click', () => renameRoom(room));

    const deleteBtn = document.createElement('button');

    deleteBtn.type = 'button';
    deleteBtn.className = 'icon-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.disabled = room.id === 'general';

    deleteBtn.title =
      room.id === 'general' ? 'The default room cannot be deleted' : '';
    deleteBtn.addEventListener('click', () => deleteRoom(room));

    actions.append(renameBtn, deleteBtn);
    item.append(nameEl, actions);
    roomListEl.append(item);
  });
}

async function renameRoom(room) {
  const newName = await showPrompt('New room name:', room.name);

  if (newName) {
    socket.emit('room:rename', { roomId: room.id, name: newName });
  }
}

async function deleteRoom(room) {
  const confirmed = await showConfirm(`Delete room "${room.name}"?`);

  if (confirmed) {
    socket.emit('room:delete', room.id);
  }
}

function joinRoom(roomId) {
  currentRoomId = roomId;
  socket.emit('room:join', roomId);
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderMessage(message) {
  const item = document.createElement('li');

  item.className = 'message-item';

  if (message.author === username) {
    item.classList.add('own');
  }

  const meta = document.createElement('div');

  meta.className = 'message-meta';

  const author = document.createElement('span');

  author.className = 'message-author';
  author.textContent = message.author;

  const time = document.createElement('span');

  time.className = 'message-time';
  time.textContent = formatTime(message.time);

  meta.append(author, time);

  const text = document.createElement('div');

  text.className = 'message-text';
  text.textContent = message.text;

  item.append(meta, text);
  messageListEl.append(item);
}

function scrollMessagesToBottom() {
  messageListEl.scrollTop = messageListEl.scrollHeight;
}

// --- Event listeners ---

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newUsername = usernameInput.value.trim();

  if (newUsername) {
    joinAsUser(newUsername);
  }
});

changeUsernameBtn.addEventListener('click', () => {
  localStorage.removeItem(USERNAME_STORAGE_KEY);
  username = '';
  usernameInput.value = '';
  showScreen('login');
});

createRoomForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const roomName = roomNameInput.value.trim();

  if (roomName) {
    socket.emit('room:create', roomName);
    roomNameInput.value = '';
  }
});

leaveRoomBtn.addEventListener('click', () => {
  currentRoomId = null;
  messageListEl.innerHTML = '';
  showScreen('rooms');
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (text && currentRoomId) {
    socket.emit('message:send', text);
    messageInput.value = '';
  }
});

// --- Socket events ---

socket.on('room:list', (roomList) => {
  rooms = roomList;
  renderRoomList();
});

socket.on('room:history', ({ roomId, name: roomName, messages }) => {
  currentRoomId = roomId;
  chatRoomNameEl.textContent = roomName;
  messageListEl.innerHTML = '';
  messages.forEach(renderMessage);
  scrollMessagesToBottom();
  showScreen('chat');
});

socket.on('message:new', ({ roomId, message }) => {
  if (roomId === currentRoomId) {
    renderMessage(message);
    scrollMessagesToBottom();
  }
});

socket.on('room:closed', ({ roomId }) => {
  if (roomId === currentRoomId) {
    currentRoomId = null;
    messageListEl.innerHTML = '';
    showToast('This room has been deleted.');
    showScreen('rooms');
  }
});

// --- Init ---

if (username) {
  joinAsUser(username);
} else {
  showScreen('login');
}
