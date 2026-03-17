'use strict';

// ── DOM refs ─────────────────────────────────────────────────────────────────
const loginScreen = document.getElementById('login-screen');
const app = document.getElementById('app');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const userAvatar = document.getElementById('user-avatar');
const usernameDisplay = document.getElementById('username-display');
const roomsList = document.getElementById('rooms-list');
const createRoomBtn = document.getElementById('create-room-btn');
const roomTitle = document.getElementById('room-title');
const noRoom = document.getElementById('no-room');
const messages = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const connDot = document.getElementById('connection-dot');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitleEl = document.getElementById('modal-title');
const modalInput = document.getElementById('modal-input');
const modalOk = document.getElementById('modal-ok');
const modalCancel = document.getElementById('modal-cancel');
const toast = document.getElementById('toast');

// ── State ────────────────────────────────────────────────────────────────────
let ws = null;
let currentUsername = localStorage.getItem('chat_username') || '';
let currentRoomId = null;
let knownRooms = []; // [{ id, name }]

// ── Toast ────────────────────────────────────────────────────────────────────
let toastTimer = null;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Modal helpers ────────────────────────────────────────────────────────────
let modalResolve = null;

function openModal(title, defaultValue = '') {
  modalTitleEl.textContent = title;
  modalInput.value = defaultValue;
  modalOverlay.classList.add('visible');
  modalInput.focus();
  modalInput.select();

  return new Promise((resolve) => {
    modalResolve = resolve;
  });
}

function closeModal(value) {
  modalOverlay.classList.remove('visible');

  if (modalResolve) {
    modalResolve(value);
    modalResolve = null;
  }
}

modalOk.addEventListener('click', () => closeModal(modalInput.value.trim()));
modalCancel.addEventListener('click', () => closeModal(null));

modalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    closeModal(modalInput.value.trim());
  }

  if (e.key === 'Escape') {
    closeModal(null);
  }
});

// ── WebSocket ────────────────────────────────────────────────────────────────
function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';

  ws = new WebSocket(`${proto}://${location.host}`);

  ws.addEventListener('open', () => {
    connDot.classList.remove('disconnected');

    if (currentUsername) {
      send('set_username', { username: currentUsername });
    }
  });

  ws.addEventListener('close', () => {
    connDot.classList.add('disconnected');
    setTimeout(connect, 2000); // auto-reconnect
  });

  ws.addEventListener('message', (evt) => {
    const { type, ...payload } = JSON.parse(evt.data);
    const handler = messageHandlers[type];

    if (handler) {
      handler(payload);
    }
  });
}

function send(type, payload = {}) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, ...payload }));
  }
}

// ── Message handlers (server → client) ───────────────────────────────────────
const messageHandlers = {
  username_confirmed({ username }) {
    currentUsername = username;
    localStorage.setItem('chat_username', username);
    userAvatar.textContent = username[0].toUpperCase();
    usernameDisplay.textContent = username;

    loginScreen.style.display = 'none';
    app.classList.add('visible');
  },

  room_list({ rooms }) {
    knownRooms = rooms;
    renderRoomList();
  },

  room_created({ room }) {
    send('join_room', { roomId: room.id });
  },

  room_joined({ room, messages: msgHistory }) {
    currentRoomId = room.id;
    roomTitle.textContent = '# ' + room.name;

    noRoom.style.display = 'none';
    messages.style.display = 'flex';
    messageForm.style.display = 'flex';

    messages.innerHTML = '';

    msgHistory.forEach(renderMessage);
    scrollToBottom();
    renderRoomList();
    messageInput.focus();
  },

  // FIX: server sends { roomId, name } — was destructuring roomName
  room_renamed({ roomId, name: roomName }) {
    if (roomId === currentRoomId) {
      roomTitle.textContent = '# ' + roomName;
      addSystemMessage(`Room renamed to "${roomName}"`);
    }
  },

  room_deleted({ roomId }) {
    if (roomId === currentRoomId) {
      currentRoomId = null;
      roomTitle.textContent = 'Select a room';
      noRoom.style.display = 'flex';
      messages.style.display = 'none';
      messageForm.style.display = 'none';
      addSystemMessage('This room was deleted.');
    }
  },

  new_message({ message }) {
    renderMessage(message);
    scrollToBottom();
  },

  user_joined({ username }) {
    addSystemMessage(`${username} joined the room`);
  },

  user_left({ username }) {
    addSystemMessage(`${username} left the room`);
  },

  error({ message }) {
    showToast(message);
  },
};

// ── Rendering ────────────────────────────────────────────────────────────────
function renderRoomList() {
  roomsList.innerHTML = '';

  knownRooms.forEach(({ id, name: roomName }) => {
    const li = document.createElement('li');

    if (id === currentRoomId) {
      li.classList.add('active');
    }

    li.innerHTML = `
      <span class="room-name"># ${escHtml(roomName)}</span>
      <span class="room-actions">
        <button class="icon-btn rename-btn" title="Rename">✏️</button>
        <button class="icon-btn danger delete-btn" title="Delete">🗑</button>
      </span>
    `;

    li.querySelector('.room-name').addEventListener('click', () => {
      send('join_room', { roomId: id });
    });

    li.querySelector('.rename-btn').addEventListener('click', async (e) => {
      e.stopPropagation();

      const newName = await openModal('Rename room', roomName);

      if (newName) {
        send('rename_room', { roomId: id, name: newName });
      }
    });

    li.querySelector('.delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation();

      const confirmed = await openModal(
        `Delete "${roomName}"? Type "delete" to confirm`,
        '',
      );

      if (confirmed === 'delete') {
        send('delete_room', { roomId: id });
      }
    });

    roomsList.appendChild(li);
  });
}

function renderMessage(msg) {
  const isOwn = msg.author === currentUsername;
  const div = document.createElement('div');

  div.className = `message ${isOwn ? 'own' : 'other'}`;

  const time = new Date(msg.time).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  div.innerHTML = `
    <div class="message-meta">
      <span class="message-author">${escHtml(msg.author)}</span>
      <span class="message-time">${time}</span>
    </div>
    <div class="message-bubble">${escHtml(msg.text)}</div>
  `;

  messages.appendChild(div);
}

function addSystemMessage(text) {
  const div = document.createElement('div');

  div.className = 'message system';
  div.innerHTML = `<div class="message-bubble">${escHtml(text)}</div>`;
  messages.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Event listeners ──────────────────────────────────────────────────────────

// Login
function tryLogin() {
  const userName = usernameInput.value.trim();

  if (!userName) {
    return;
  }
  send('set_username', { username: userName });
}

loginBtn.addEventListener('click', tryLogin);
// eslint-disable-next-line
usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    tryLogin();
  }
});

// Send message
sendBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();

  if (!text) {
    return;
  }
  send('send_message', { text });
  messageInput.value = '';
  messageInput.focus();
});

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

// Create room — FIX: was sending { roomName }, server expects { name }
createRoomBtn.addEventListener('click', async () => {
  const roomName = await openModal('New room name');

  if (roomName) {
    send('create_room', { name: roomName });
  }
});

// ── Boot ────────────────────────────────────────────────────────────────────
connect();

// Pre-fill username if saved
if (currentUsername) {
  usernameInput.value = currentUsername;
}
