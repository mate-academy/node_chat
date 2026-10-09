'use strict';

const $ = (selector) => document.querySelector(selector);

const loginPanel = $('#login-panel');
const chatPanel = $('#chat-panel');
const loginForm = $('#login-form');
const usernameInput = $('#username');
const currentUser = $('#current-user');
const roomList = $('#room-list');
const createRoomForm = $('#create-room-form');
const roomNameInput = $('#room-name');
const roomTitle = $('#room-title');
const messagesElement = $('#messages');
const messageForm = $('#message-form');
const messageInput = $('#message-text');
const statusElement = $('#status');

let username = localStorage.getItem('chatUsername') || '';
let activeRoomId = 'general';
let rooms = [];

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

function showStatus(message = '') {
  statusElement.textContent = message;
}

function showChat() {
  loginPanel.hidden = true;
  chatPanel.hidden = false;
  currentUser.textContent = `Signed in as ${username}`;
}

function renderRooms() {
  roomList.replaceChildren();

  rooms.forEach((room) => {
    const item = document.createElement('li');

    item.className = 'room-item';

    const selectButton = document.createElement('button');

    selectButton.className = 'room-select';
    selectButton.textContent = `${room.name} (${room.messageCount})`;

    if (room.id === activeRoomId) {
      selectButton.classList.add('active');
    }

    selectButton.addEventListener('click', async () => {
      activeRoomId = room.id;
      await refreshRooms();
      await loadMessages();
    });

    item.append(selectButton);

    if (room.id !== 'general') {
      const renameButton = document.createElement('button');

      renameButton.textContent = 'Rename';
      renameButton.addEventListener('click', () => renameRoom(room));

      const deleteButton = document.createElement('button');

      deleteButton.className = 'room-delete';
      deleteButton.textContent = '×';
      deleteButton.setAttribute('aria-label', `Delete ${room.name}`);
      deleteButton.addEventListener('click', () => deleteRoom(room));

      item.append(renameButton, deleteButton);
    }

    roomList.append(item);
  });

  const activeRoom = rooms.find((room) => room.id === activeRoomId);

  if (activeRoom) {
    roomTitle.textContent = activeRoom.name;
  }
}

async function refreshRooms() {
  rooms = await api('/api/rooms');

  if (!rooms.some((room) => room.id === activeRoomId)) {
    activeRoomId = rooms[0]?.id || 'general';
  }

  renderRooms();
}

async function loadMessages() {
  showStatus('Loading messages...');
  messagesElement.replaceChildren();

  try {
    const messages = await api(
      `/api/rooms/${encodeURIComponent(activeRoomId)}/messages`,
    );

    messagesElement.replaceChildren();

    if (messages.length === 0) {
      const emptyMessage = document.createElement('p');

      emptyMessage.textContent = 'No messages yet. Start the conversation!';
      messagesElement.append(emptyMessage);
    }

    messages.forEach((message) => {
      const article = document.createElement('article');

      article.className = 'message';

      const meta = document.createElement('div');

      meta.className = 'message-meta';

      const author = document.createElement('strong');

      author.textContent = message.author;

      const time = document.createElement('time');
      const date = new Date(message.time);

      time.dateTime = message.time;

      time.textContent = Number.isNaN(date.getTime())
        ? message.time
        : date.toLocaleString();

      const text = document.createElement('p');

      text.textContent = message.text;

      meta.append(author, time);
      article.append(meta, text);
      messagesElement.append(article);
    });

    messagesElement.scrollTop = messagesElement.scrollHeight;
    showStatus('');
    await refreshRooms();
  } catch (error) {
    showStatus(error.message);
  }
}

async function createRoom(submitEvent) {
  event.preventDefault();
  showStatus('');

  try {
    const room = await api('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ name: roomNameInput.value }),
    });

    roomNameInput.value = '';
    activeRoomId = room.id;

    await refreshRooms();
    await loadMessages();
  } catch (error) {
    showStatus(error.message);
  }
}

async function renameRoom(room) {
  const newName = prompt('Enter the new room name:', room.name);

  if (newName === null || !name.trim()) {
    return;
  }

  showStatus('');

  try {
    await api(`/api/rooms/${encodeURIComponent(room.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ newName }),
    });

    await refreshRooms();
  } catch (error) {
    showStatus(error.message);
  }
}

async function deleteRoom(room) {
  if (!confirm(`Delete the room "${room.name}" and its messages?`)) {
    return;
  }

  showStatus('');

  try {
    await api(`/api/rooms/${encodeURIComponent(room.id)}`, {
      method: 'DELETE',
    });

    if (activeRoomId === room.id) {
      activeRoomId = 'general';
    }

    await refreshRooms();
    await loadMessages();
  } catch (error) {
    showStatus(error.message);
  }
}

async function sendMessage(submitEvent) {
  event.preventDefault();

  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

  showStatus('');

  try {
    await api(`/api/rooms/${encodeURIComponent(activeRoomId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        author: username,
        text,
      }),
    });

    messageInput.value = '';
    await loadMessages();
  } catch (error) {
    showStatus(error.message);
  }
}

async function login(submitEvent) {
  event.preventDefault();
  showStatus('');

  try {
    const result = await api('/api/username', {
      method: 'POST',
      body: JSON.stringify({ username: usernameInput.value }),
    });

    username = result.username;
    localStorage.setItem('chatUsername', username);

    showChat();
    await refreshRooms();
    await loadMessages();
  } catch (error) {
    showStatus(error.message);
  }
}

loginForm.addEventListener('submit', login);
createRoomForm.addEventListener('submit', createRoom);
messageForm.addEventListener('submit', sendMessage);

if (username) {
  usernameInput.value = username;
  showChat();

  Promise.resolve()
    .then(refreshRooms)
    .then(loadMessages)
    .catch((error) => showStatus(error.message));
}
