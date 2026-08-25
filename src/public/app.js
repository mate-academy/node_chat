/* eslint-env browser */
'use strict';

const elements = {
  cancelUsername: document.querySelector('#cancel-username'),
  createRoom: document.querySelector('#create-room'),
  deleteRoom: document.querySelector('#delete-room'),
  editUsername: document.querySelector('#edit-username'),
  menuButton: document.querySelector('#menu-button'),
  messageForm: document.querySelector('#message-form'),
  messageInput: document.querySelector('#message-input'),
  messages: document.querySelector('#messages'),
  profileAvatar: document.querySelector('#profile-avatar'),
  profileName: document.querySelector('#profile-name'),
  renameRoom: document.querySelector('#rename-room'),
  roomList: document.querySelector('#room-list'),
  roomSubtitle: document.querySelector('#room-subtitle'),
  roomTitle: document.querySelector('#room-title'),
  sendMessage: document.querySelector('#send-message'),
  sidebar: document.querySelector('#sidebar'),
  sidebarBackdrop: document.querySelector('#sidebar-backdrop'),
  status: document.querySelector('#status'),
  usernameDialog: document.querySelector('#username-dialog'),
  usernameForm: document.querySelector('#username-form'),
  usernameInput: document.querySelector('#username-input'),
};

const state = {
  activeRoomId: localStorage.getItem('activeRoomId'),
  eventSource: null,
  messageIds: new Set(),
  rooms: [],
  statusTimer: null,
  username: localStorage.getItem('username') || '',
};

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(data.error || 'Не вдалося виконати дію');
  }

  return response.status === 204 ? null : response.json();
}

function showStatus(message) {
  clearTimeout(state.statusTimer);
  elements.status.textContent = message;
  elements.status.classList.add('visible');

  state.statusTimer = setTimeout(
    () => elements.status.classList.remove('visible'),
    4000,
  );
}

function getInitials(displayName) {
  return displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function updateProfile() {
  elements.profileName.textContent = state.username || 'Гість';

  elements.profileAvatar.textContent = state.username
    ? getInitials(state.username)
    : '?';
}

function getActiveRoom() {
  return state.rooms.find((room) => room.id === state.activeRoomId);
}

function renderRooms() {
  elements.roomList.replaceChildren();

  state.rooms.forEach((room) => {
    const button = document.createElement('button');
    const hash = document.createElement('span');
    const info = document.createElement('span');
    const roomName = document.createElement('span');
    const preview = document.createElement('span');
    const count = document.createElement('span');

    button.type = 'button';
    button.className = `room-item${room.id === state.activeRoomId ? ' active' : ''}`;
    hash.className = 'room-item__hash';
    hash.textContent = '#';
    info.className = 'room-item__info';
    roomName.className = 'room-item__name';
    roomName.textContent = room.name;
    preview.className = 'room-item__preview';

    preview.textContent = room.lastMessage
      ? `${room.lastMessage.author}: ${room.lastMessage.text}`
      : 'Ще немає повідомлень';
    count.className = 'room-item__count';
    count.textContent = room.messageCount;
    info.append(roomName, preview);
    button.append(hash, info, count);
    button.addEventListener('click', () => joinRoom(room.id));
    elements.roomList.append(button);
  });

  updateRoomHeader();
}

function updateRoomHeader() {
  const room = getActiveRoom();

  elements.roomTitle.textContent = room ? `# ${room.name}` : 'Оберіть кімнату';

  elements.roomSubtitle.textContent = room
    ? `${room.messageCount} ${room.messageCount === 1 ? 'повідомлення' : 'повідомлень'}`
    : 'Почніть розмову';
  elements.renameRoom.disabled = !room;
  elements.deleteRoom.disabled = !room || state.rooms.length === 1;
  elements.messageInput.disabled = !room;
  elements.sendMessage.disabled = !room;
}

function createEmptyState() {
  const wrapper = document.createElement('div');
  const icon = document.createElement('span');
  const title = document.createElement('h2');
  const text = document.createElement('p');

  wrapper.className = 'empty-state';
  icon.textContent = '✦';
  title.textContent = 'Тут поки тихо';
  text.textContent = 'Надішліть перше повідомлення та почніть розмову.';
  wrapper.append(icon, title, text);

  return wrapper;
}

function appendMessage(message, shouldScroll = true) {
  if (state.messageIds.has(message.id)) {
    return;
  }

  const article = document.createElement('article');
  const avatar = document.createElement('span');
  const content = document.createElement('div');
  const meta = document.createElement('div');
  const author = document.createElement('span');
  const time = document.createElement('time');
  const text = document.createElement('p');
  const date = new Date(message.time);

  if (elements.messages.querySelector('.empty-state')) {
    elements.messages.replaceChildren();
  }

  article.className = 'message';
  article.dataset.messageId = message.id;
  avatar.className = 'message__avatar';
  avatar.textContent = getInitials(message.author);
  meta.className = 'message__meta';
  author.className = 'message__author';
  author.textContent = message.author;
  time.className = 'message__time';
  time.dateTime = message.time;
  time.title = date.toLocaleString('uk-UA');

  time.textContent = date.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
  text.className = 'message__text';
  text.textContent = message.text;
  meta.append(author, time);
  content.append(meta, text);
  article.append(avatar, content);
  elements.messages.append(article);
  state.messageIds.add(message.id);

  if (shouldScroll) {
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }
}

function renderMessages(messages) {
  state.messageIds.clear();
  elements.messages.replaceChildren();

  if (messages.length === 0) {
    elements.messages.append(createEmptyState());

    return;
  }

  messages.forEach((message) => appendMessage(message, false));
  elements.messages.scrollTop = elements.messages.scrollHeight;
}

function closeSidebar() {
  elements.sidebar.classList.remove('open');
  elements.sidebarBackdrop.classList.remove('visible');
}

async function joinRoom(roomId) {
  if (!state.username || roomId === state.activeRoomId) {
    closeSidebar();

    return;
  }

  try {
    const result = await api(`/api/rooms/${encodeURIComponent(roomId)}/join`, {
      method: 'POST',
      body: JSON.stringify({ username: state.username }),
    });

    state.activeRoomId = result.room.id;
    localStorage.setItem('activeRoomId', state.activeRoomId);
    renderRooms();
    renderMessages(result.messages);
    elements.messageInput.focus();
    closeSidebar();
  } catch (error) {
    showStatus(error.message);
    await loadRooms();
  }
}

async function loadRooms() {
  try {
    state.rooms = await api('/api/rooms');

    const roomExists = state.rooms.some(
      (room) => room.id === state.activeRoomId,
    );
    const nextRoomId = roomExists ? state.activeRoomId : state.rooms[0]?.id;

    if (!roomExists) {
      state.activeRoomId = null;
    }

    renderRooms();

    if (nextRoomId && state.username && nextRoomId !== state.activeRoomId) {
      await joinRoom(nextRoomId);
    } else if (nextRoomId && state.username && state.messageIds.size === 0) {
      const result = await api(
        `/api/rooms/${encodeURIComponent(nextRoomId)}/join`,
        {
          method: 'POST',
          body: JSON.stringify({ username: state.username }),
        },
      );

      renderMessages(result.messages);
    }
  } catch (error) {
    showStatus(error.message);
  }
}

function connectToEvents() {
  state.eventSource = new EventSource('/api/events');

  state.eventSource.addEventListener('rooms', (serverEvent) => {
    state.rooms = JSON.parse(serverEvent.data);
    renderRooms();
  });

  state.eventSource.addEventListener('message', (serverEvent) => {
    const payload = JSON.parse(serverEvent.data);

    if (payload.roomId === state.activeRoomId) {
      appendMessage(payload.message);
    }
  });

  state.eventSource.addEventListener('room-deleted', async (serverEvent) => {
    const { roomId } = JSON.parse(serverEvent.data);

    if (roomId === state.activeRoomId) {
      state.activeRoomId = null;
      localStorage.removeItem('activeRoomId');
      renderMessages([]);
      await loadRooms();
    }
  });
}

async function saveUsername(username) {
  const result = await api('/api/users', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });

  state.username = result.username;
  localStorage.setItem('username', state.username);
  updateProfile();
  elements.usernameDialog.close();
  await loadRooms();
}

elements.usernameForm.addEventListener('submit', async (submitEvent) => {
  submitEvent.preventDefault();

  try {
    await saveUsername(elements.usernameInput.value);
  } catch (error) {
    showStatus(error.message);
  }
});

elements.cancelUsername.addEventListener('click', () => {
  if (state.username) {
    elements.usernameDialog.close();
  }
});

elements.editUsername.addEventListener('click', () => {
  elements.usernameInput.value = state.username;
  elements.cancelUsername.hidden = !state.username;
  elements.usernameDialog.showModal();
  elements.usernameInput.select();
});

elements.createRoom.addEventListener('click', async () => {
  const roomName = window.prompt('Назва нової кімнати:');

  if (!roomName) {
    return;
  }

  try {
    const room = await api('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ name: roomName }),
    });

    await loadRooms();
    await joinRoom(room.id);
  } catch (error) {
    showStatus(error.message);
  }
});

elements.renameRoom.addEventListener('click', async () => {
  const room = getActiveRoom();

  if (!room) {
    return;
  }

  const roomName = window.prompt('Нова назва кімнати:', room.name);

  if (!roomName || roomName === room.name) {
    return;
  }

  try {
    await api(`/api/rooms/${encodeURIComponent(room.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: roomName }),
    });
  } catch (error) {
    showStatus(error.message);
  }
});

elements.deleteRoom.addEventListener('click', async () => {
  const room = getActiveRoom();

  if (
    !room ||
    !window.confirm(
      `Видалити кімнату «${room.name}» разом з усіма повідомленнями?`,
    )
  ) {
    return;
  }

  try {
    await api(`/api/rooms/${encodeURIComponent(room.id)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    showStatus(error.message);
  }
});

elements.messageForm.addEventListener('submit', async (submitEvent) => {
  submitEvent.preventDefault();

  const text = elements.messageInput.value.trim();

  if (!text || !state.activeRoomId) {
    return;
  }

  elements.sendMessage.disabled = true;

  try {
    const message = await api(
      `/api/rooms/${encodeURIComponent(state.activeRoomId)}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ author: state.username, text }),
      },
    );

    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    appendMessage(message);
  } catch (error) {
    showStatus(error.message);
  } finally {
    elements.sendMessage.disabled = !state.activeRoomId;
    elements.messageInput.focus();
  }
});

elements.messageInput.addEventListener('keydown', (keyboardEvent) => {
  if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
    keyboardEvent.preventDefault();
    elements.messageForm.requestSubmit();
  }
});

elements.messageInput.addEventListener('input', () => {
  elements.messageInput.style.height = 'auto';
  elements.messageInput.style.height = `${elements.messageInput.scrollHeight}px`;
});

elements.menuButton.addEventListener('click', () => {
  elements.sidebar.classList.add('open');
  elements.sidebarBackdrop.classList.add('visible');
});
elements.sidebarBackdrop.addEventListener('click', closeSidebar);

async function initialize() {
  updateProfile();
  connectToEvents();
  await loadRooms();

  if (!state.username) {
    elements.cancelUsername.hidden = true;
    elements.usernameDialog.showModal();
    elements.usernameInput.focus();
  }
}

initialize();
