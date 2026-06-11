'use strict';

/* eslint-env browser */

/* ── Socket ──────────────────────────────────────────────────────────────── */
const socket = io();

/* ── State ───────────────────────────────────────────────────────────────── */
let currentUser = null;
let currentRoomId = null;
let rooms = [];

/* ── DOM refs ────────────────────────────────────────────────────────────── */
const usernameModal = document.getElementById('username-modal');
const usernameInput = document.getElementById('username-input');
const usernameSubmit = document.getElementById('username-submit');
const usernameError = document.getElementById('username-error');
const app = document.getElementById('app');
const currentUserEl = document.getElementById('current-user');
const roomsList = document.getElementById('rooms-list');
const createRoomBtn = document.getElementById('create-room-btn');
const noRoomSelected = document.getElementById('no-room-selected');
const roomContainer = document.getElementById('room-container');
const roomNameDisplay = document.getElementById('room-name-display');
const renameRoomBtn = document.getElementById('rename-room-btn');
const deleteRoomBtn = document.getElementById('delete-room-btn');
const messagesEl = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function escapeHtml(text) {
  const el = document.createElement('div');

  el.appendChild(document.createTextNode(String(text)));

  return el.innerHTML;
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function showError(msg) {
  usernameError.textContent = msg;
  usernameError.classList.remove('hidden');
}

function clearError() {
  usernameError.classList.add('hidden');
}

/* ── Username ────────────────────────────────────────────────────────────── */
function setUsername(username) {
  socket.emit('setUsername', username, (res) => {
    if (res.success) {
      currentUser = res.user;
      // eslint-disable-next-line no-undef
      localStorage.setItem('chatUsername', username);
      usernameModal.classList.add('hidden');
      app.classList.remove('hidden');
      currentUserEl.textContent = username;
      loadRooms();
    } else {
      showError(res.error || 'Failed to set username.');
    }
  });
}

usernameSubmit.addEventListener('click', () => {
  const username = usernameInput.value.trim();

  if (!username) {
    return showError('Username cannot be empty.');
  }
  clearError();
  setUsername(username);
});

usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    usernameSubmit.click();
  }
});

/* ── Rooms ─────────────────────────────────────────────────────────────────── */
function loadRooms() {
  socket.emit('getRooms', (res) => {
    if (res.success) {
      rooms = res.rooms;
      renderRooms();
    }
  });
}

function renderRooms() {
  roomsList.innerHTML = '';

  rooms.forEach((room) => {
    const li = document.createElement('li');

    li.dataset.roomId = room.id;
    li.textContent = room.name;
    li.classList.toggle('active', room.id === currentRoomId);
    li.addEventListener('click', () => joinRoom(room.id, room.name));
    roomsList.appendChild(li);
  });
}

createRoomBtn.addEventListener('click', () => {
  const roomName = prompt('Room name:');

  if (roomName && roomName.trim()) {
    socket.emit('createRoom', roomName.trim(), (res) => {
      if (!res.success) {
        alert('Error: ' + res.error);
      }
    });
  }
});

function joinRoom(roomId, roomName) {
  currentRoomId = roomId;

  socket.emit('joinRoom', { roomId }, (res) => {
    if (res.success) {
      noRoomSelected.classList.add('hidden');
      roomContainer.classList.remove('hidden');
      roomNameDisplay.textContent = roomName;
      renderMessages(res.messages);
      renderRooms();
    } else {
      alert('Error: ' + res.error);
    }
  });
}

renameRoomBtn.addEventListener('click', () => {
  const newName = prompt('New room name:');

  if (newName && newName.trim()) {
    socket.emit(
      'renameRoom',
      { roomId: currentRoomId, newName: newName.trim() },
      (res) => {
        if (!res.success) {
          alert('Error: ' + res.error);
        }
      },
    );
  }
});

deleteRoomBtn.addEventListener('click', () => {
  if (confirm('Delete this room and all its messages?')) {
    socket.emit('deleteRoom', { roomId: currentRoomId }, (res) => {
      if (res.success) {
        currentRoomId = null;
        noRoomSelected.classList.remove('hidden');
        roomContainer.classList.add('hidden');
      } else {
        alert('Error: ' + res.error);
      }
    });
  }
});

/* ── Messages ──────────────────────────────────────────────────────────────── */
function renderMessages(msgs) {
  messagesEl.innerHTML = '';
  msgs.forEach((msg) => appendMessage(msg));
  scrollToBottom();
}

function appendMessage(msg) {
  const div = document.createElement('div');
  const isOwn = currentUser && msg.userId === currentUser.id;
  const authorName = msg.author ? msg.author.username : 'Unknown';

  div.classList.add('message');

  if (isOwn) {
    div.classList.add('own');
  }

  div.innerHTML =
    `<div class="message-meta">` +
    `<span class="author">${escapeHtml(authorName)}</span>` +
    `<span class="time">${formatTime(msg.createdAt)}</span>` +
    `</div>` +
    `<div class="message-text">${escapeHtml(msg.text)}</div>`;

  messagesEl.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (!text || !currentRoomId) {
    return;
  }

  socket.emit('sendMessage', { roomId: currentRoomId, text }, (res) => {
    if (!res.success) {
      alert('Error: ' + res.error);
    }
  });

  messageInput.value = '';
});

/* ── Socket events (broadcast from server) ─────────────────────────────────── */
socket.on('roomCreated', (room) => {
  rooms.push(room);
  renderRooms();
});

socket.on('roomRenamed', ({ roomId, newName }) => {
  const room = rooms.find((r) => r.id === roomId);

  if (room) {
    room.name = newName;
  }

  if (currentRoomId === roomId) {
    roomNameDisplay.textContent = newName;
  }
  renderRooms();
});

socket.on('roomDeleted', ({ roomId }) => {
  rooms = rooms.filter((r) => r.id !== roomId);

  if (currentRoomId === roomId) {
    currentRoomId = null;
    noRoomSelected.classList.remove('hidden');
    roomContainer.classList.add('hidden');
  }

  renderRooms();
});

socket.on('newMessage', (msg) => {
  if (msg.roomId === currentRoomId) {
    appendMessage(msg);
  }
});

/* ── Init on socket connect ────────────────────────────────────────────────── */
socket.on('connect', () => {
  const savedUsername = localStorage.getItem('chatUsername');

  if (savedUsername) {
    setUsername(savedUsername);
  }
  // else: modal is already visible by default
});
