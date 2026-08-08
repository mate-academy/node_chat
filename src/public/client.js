/* eslint-env browser */
'use strict';

const STORAGE_KEY = 'chat_username';

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const usernameSubmit = document.getElementById('username-submit');
const currentUsernameEl = document.getElementById('current-username');

const roomsListEl = document.getElementById('rooms-list');
const addRoomBtn = document.getElementById('add-room-btn');
const roomTitleEl = document.getElementById('room-title');
const renameRoomBtn = document.getElementById('rename-room-btn');
const deleteRoomBtn = document.getElementById('delete-room-btn');

const messagesListEl = document.getElementById('messages-list');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let ws = null;
let username = localStorage.getItem(STORAGE_KEY) || '';
let rooms = [];
let currentRoomId = null;

function formatTime(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderRooms() {
  roomsListEl.innerHTML = '';

  rooms.forEach((room) => {
    const li = document.createElement('li');

    li.textContent = room.name;
    li.dataset.roomId = room.id;

    if (room.id === currentRoomId) {
      li.classList.add('active');
    }

    li.addEventListener('click', () => {
      switchRoom(room.id);
    });

    roomsListEl.appendChild(li);
  });
}

function renderRoomTitle() {
  const room = rooms.find((r) => r.id === currentRoomId);

  roomTitleEl.textContent = room ? room.name : '';
}

function addMessageToList(message) {
  const li = document.createElement('li');

  li.className = 'message';

  const meta = document.createElement('div');

  meta.className = 'message-meta';

  const author = document.createElement('span');

  author.className = 'message-author';
  author.textContent = message.author;

  const time = document.createElement('span');

  time.className = 'message-time';
  time.textContent = formatTime(message.time);

  meta.appendChild(author);
  meta.appendChild(time);

  const text = document.createElement('p');

  text.className = 'message-text';
  text.textContent = message.text;

  li.appendChild(meta);
  li.appendChild(text);
  messagesListEl.appendChild(li);
  messagesListEl.scrollTop = messagesListEl.scrollHeight;
}

function addSystemMessage(text) {
  const li = document.createElement('li');

  li.className = 'system-message';
  li.textContent = text;
  messagesListEl.appendChild(li);
  messagesListEl.scrollTop = messagesListEl.scrollHeight;
}

function switchRoom(roomId) {
  currentRoomId = roomId;
  renderRooms();
  renderRoomTitle();
  send({ type: 'switchRoom', roomId });
}

function send(data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function connect() {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

  ws = new WebSocket(`${protocol}://${window.location.host}`);

  ws.addEventListener('open', () => {
    send({ type: 'join', username, roomId: currentRoomId });
  });

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'roomsList': {
        rooms = data.rooms;

        if (!currentRoomId && rooms.length > 0) {
          currentRoomId = rooms[0].id;
        }

        renderRooms();
        renderRoomTitle();
        break;
      }

      case 'history': {
        if (data.roomId !== currentRoomId) {
          return;
        }

        messagesListEl.innerHTML = '';
        data.messages.forEach(addMessageToList);
        break;
      }

      case 'message': {
        if (data.roomId !== currentRoomId) {
          return;
        }

        addMessageToList(data.message);
        break;
      }

      case 'system': {
        addSystemMessage(data.text);
        break;
      }

      default:
        break;
    }
  });

  ws.addEventListener('close', () => {
    setTimeout(connect, 1000);
  });
}

function showChatScreen() {
  loginScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  currentUsernameEl.textContent = username;
  connect();
}

usernameSubmit.addEventListener('click', () => {
  const value = usernameInput.value.trim();

  if (!value) {
    return;
  }

  username = value;
  localStorage.setItem(STORAGE_KEY, username);
  showChatScreen();
});

usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    usernameSubmit.click();
  }
});

addRoomBtn.addEventListener('click', () => {
  const name = prompt('Room name:');

  if (name && name.trim()) {
    send({ type: 'createRoom', name: name.trim() });
  }
});

renameRoomBtn.addEventListener('click', () => {
  if (!currentRoomId) {
    return;
  }

  const name = prompt('New room name:');

  if (name && name.trim()) {
    send({ type: 'renameRoom', roomId: currentRoomId, name: name.trim() });
  }
});

deleteRoomBtn.addEventListener('click', () => {
  if (!currentRoomId) {
    return;
  }

  if (confirm('Delete this room?')) {
    send({ type: 'deleteRoom', roomId: currentRoomId });
    currentRoomId = null;
  }
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

  send({ type: 'message', text });
  messageInput.value = '';
});

if (username) {
  showChatScreen();
}
