/* eslint-env browser */
'use strict';

const { MessageType, USERNAME_STORAGE_KEY } = window.ChatConstants;

const authPanel = document.getElementById('auth-panel');
const chatPanel = document.getElementById('chat-panel');
const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');
const authError = document.getElementById('auth-error');
const currentUserEl = document.getElementById('current-user');
const changeUsernameBtn = document.getElementById('change-username-btn');
const roomsList = document.getElementById('rooms-list');
const roomTitle = document.getElementById('room-title');
const roomActions = document.getElementById('room-actions');
const createRoomBtn = document.getElementById('create-room-btn');
const renameRoomBtn = document.getElementById('rename-room-btn');
const deleteRoomBtn = document.getElementById('delete-room-btn');
const messagesList = document.getElementById('messages-list');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let socket = null;
let username = null;
let currentRoomId = null;
let rooms = [];
const messagesByRoom = new Map();

function getWsUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

  return `${protocol}//${window.location.host}`;
}

function connect() {
  socket = new WebSocket(getWsUrl());

  socket.addEventListener('open', () => {
    const saved = localStorage.getItem(USERNAME_STORAGE_KEY);

    if (saved) {
      setUsernameOnServer(saved);
    }
  });

  socket.addEventListener('message', (evt) => {
    handleServerMessage(JSON.parse(evt.data));
  });

  socket.addEventListener('close', () => {
    setTimeout(connect, 2000);
  });
}

function send(payload) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function showAuthError(message) {
  authError.textContent = message;
  authError.hidden = !message;
}

function setUsernameOnServer(userName) {
  send({ type: MessageType.SET_USERNAME, username: userName });
}

function showChat() {
  authPanel.hidden = true;
  chatPanel.hidden = false;
  currentUserEl.textContent = username;
}

function showAuth() {
  authPanel.hidden = false;
  chatPanel.hidden = true;
  usernameInput.value = localStorage.getItem(USERNAME_STORAGE_KEY) || '';
  usernameInput.focus();
}

function formatTime(iso) {
  return new Date(iso).toLocaleString();
}

function renderMessage(message) {
  const li = document.createElement('li');
  const article = document.createElement('article');

  article.className = 'message';

  const meta = document.createElement('div');

  meta.className = 'message-meta';
  meta.innerHTML = `<strong>${escapeHtml(message.author)}</strong> · ${formatTime(message.time)}`;

  const text = document.createElement('p');

  text.className = 'message-text';
  text.textContent = message.text;

  article.append(meta, text);
  li.append(article);

  return li;
}

function escapeHtml(text) {
  const div = document.createElement('div');

  div.textContent = text;

  return div.innerHTML;
}

function renderMessages(roomId) {
  messagesList.innerHTML = '';

  const messages = messagesByRoom.get(roomId) || [];

  for (const message of messages) {
    messagesList.append(renderMessage(message));
  }

  messagesList.scrollTop = messagesList.scrollHeight;
}

function appendMessage(roomId, message) {
  if (!messagesByRoom.has(roomId)) {
    messagesByRoom.set(roomId, []);
  }

  const list = messagesByRoom.get(roomId);

  if (list.some((item) => item.id === message.id)) {
    return;
  }

  list.push(message);

  if (roomId === currentRoomId) {
    messagesList.append(renderMessage(message));
    messagesList.scrollTop = messagesList.scrollHeight;
  }
}

function renderRooms() {
  roomsList.innerHTML = '';

  for (const room of rooms) {
    const li = document.createElement('li');

    li.textContent = room.name;
    li.dataset.roomId = room.id;

    if (room.id === currentRoomId) {
      li.classList.add('active');
      roomTitle.textContent = room.name;
    }

    li.addEventListener('click', () => {
      send({ type: MessageType.JOIN_ROOM, roomId: room.id });
    });

    roomsList.append(li);
  }

  const current = rooms.find((r) => r.id === currentRoomId);

  roomActions.hidden = !current || current.isDefault;
}

function handleServerMessage(data) {
  switch (data.type) {
    case MessageType.USERNAME_SET:
      username = data.username;
      currentRoomId = data.roomId;
      rooms = data.rooms || rooms;
      localStorage.setItem(USERNAME_STORAGE_KEY, username);
      showAuthError('');
      showChat();
      break;

    case MessageType.ROOM_HISTORY:
      messagesByRoom.set(data.roomId, data.messages);
      currentRoomId = data.roomId;
      renderMessages(currentRoomId);
      renderRooms();
      break;

    case MessageType.MESSAGE:
      appendMessage(data.roomId, data.message);
      break;

    case MessageType.ROOMS_UPDATED:
      rooms = data.rooms;
      renderRooms();
      break;

    case MessageType.ERROR:
      if (chatPanel.hidden) {
        showAuthError(data.message);
      } else {
        alert(data.message);
      }
      break;

    default:
      break;
  }
}

usernameForm.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const userName = usernameInput.value.trim();

  if (!userName) {
    return;
  }

  showAuthError('');
  setUsernameOnServer(userName);
});

changeUsernameBtn.addEventListener('click', () => {
  localStorage.removeItem(USERNAME_STORAGE_KEY);
  username = null;
  showAuth();
});

messageForm.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const text = messageInput.value.trim();

  if (!text || !currentRoomId) {
    return;
  }

  send({
    type: MessageType.SEND_MESSAGE,
    roomId: currentRoomId,
    text,
  });

  messageInput.value = '';
});

createRoomBtn.addEventListener('click', () => {
  const roomName = prompt('Room name:');

  if (roomName?.trim()) {
    send({ type: MessageType.CREATE_ROOM, name: roomName.trim() });
  }
});

renameRoomBtn.addEventListener('click', () => {
  const room = rooms.find((r) => r.id === currentRoomId);

  if (!room) {
    return;
  }

  const roomName = prompt('New room name:', room.name);

  if (roomName?.trim()) {
    send({
      type: MessageType.RENAME_ROOM,
      roomId: currentRoomId,
      name: roomName.trim(),
    });
  }
});

deleteRoomBtn.addEventListener('click', () => {
  if (!confirm('Delete this room?')) {
    return;
  }

  send({ type: MessageType.DELETE_ROOM, roomId: currentRoomId });
});

const savedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);

if (savedUsername) {
  usernameInput.value = savedUsername;
}

connect();
