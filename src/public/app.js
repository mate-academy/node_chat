'use strict';

/* global EventSource, confirm, localStorage, prompt */

const USERNAME_KEY = 'node-chat-username';
const ROOM_KEY = 'node-chat-room';

const state = {
  rooms: [],
  currentRoom: null,
  username: localStorage.getItem(USERNAME_KEY) || '',
};

const elements = {
  userForm: document.querySelector('#userForm'),
  usernameInput: document.querySelector('#usernameInput'),
  roomForm: document.querySelector('#roomForm'),
  roomInput: document.querySelector('#roomInput'),
  roomList: document.querySelector('#roomList'),
  renameRoom: document.querySelector('#renameRoom'),
  deleteRoom: document.querySelector('#deleteRoom'),
  notice: document.querySelector('#notice'),
  roomTitle: document.querySelector('#roomTitle'),
  roomInfo: document.querySelector('#roomInfo'),
  messages: document.querySelector('#messages'),
  messageForm: document.querySelector('#messageForm'),
  messageInput: document.querySelector('#messageInput'),
};

elements.usernameInput.value = state.username;

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

const showNotice = (message = '') => {
  elements.notice.textContent = message;
};

const formatTime = (value) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const renderRooms = () => {
  elements.roomList.replaceChildren(
    ...state.rooms.map((room) => {
      const item = document.createElement('li');
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'room-button';
      button.textContent = `${room.name} (${room.messageCount})`;
      button.title = room.name;

      if (state.currentRoom && state.currentRoom.id === room.id) {
        button.classList.add('active');
      }

      button.addEventListener('click', () => joinRoom(room.id));
      item.append(button);

      return item;
    }),
  );
};

const renderEmpty = (message) => {
  const empty = document.createElement('p');

  empty.className = 'empty';
  empty.textContent = message;
  elements.messages.replaceChildren(empty);
};

const renderMessages = () => {
  elements.messages.replaceChildren();

  if (!state.currentRoom) {
    elements.roomTitle.textContent = 'Choose a room';
    elements.roomInfo.textContent = 'Messages include author, time, and text.';
    renderEmpty('No room selected.');

    return;
  }

  elements.roomTitle.textContent = state.currentRoom.name;
  elements.roomInfo.textContent = `${state.currentRoom.messages.length} message(s) in this room`;

  if (state.currentRoom.messages.length === 0) {
    renderEmpty('No messages yet.');

    return;
  }

  for (const message of state.currentRoom.messages) {
    const article = document.createElement('article');
    const meta = document.createElement('div');
    const author = document.createElement('span');
    const time = document.createElement('time');
    const text = document.createElement('p');

    article.className =
      'message' + (message.author === state.username ? ' mine' : '');
    meta.className = 'meta';
    author.className = 'author';
    author.textContent = message.author;
    time.dateTime = message.time;
    time.textContent = formatTime(message.time);
    text.className = 'text';
    text.textContent = message.text;

    meta.append(author, time);
    article.append(meta, text);
    elements.messages.append(article);
  }

  elements.messages.scrollTop = elements.messages.scrollHeight;
};

const joinRoom = async (roomId) => {
  try {
    const room = await request(`/api/rooms/${roomId}`);

    state.currentRoom = room;
    localStorage.setItem(ROOM_KEY, room.id);
    renderRooms();
    renderMessages();
    showNotice();
  } catch (error) {
    showNotice(error.message);
  }
};

const syncRooms = (nextState) => {
  state.rooms = nextState.rooms;

  const savedRoomId = localStorage.getItem(ROOM_KEY);
  const hasCurrentRoom =
    state.currentRoom &&
    state.rooms.some((room) => room.id === state.currentRoom.id);

  if (!hasCurrentRoom) {
    const room =
      state.rooms.find((item) => item.id === savedRoomId) || state.rooms[0];

    if (room) {
      joinRoom(room.id);
    } else {
      state.currentRoom = null;
      renderMessages();
    }
  }

  renderRooms();
};

const loadState = async () => {
  const nextState = await request('/api/state');

  syncRooms(nextState);
};

elements.userForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const data = await request('/api/users', {
      method: 'POST',
      body: JSON.stringify({ username: elements.usernameInput.value }),
    });

    state.username = data.username;
    localStorage.setItem(USERNAME_KEY, state.username);
    elements.usernameInput.value = state.username;
    renderMessages();
    showNotice();
  } catch (error) {
    showNotice(error.message);
  }
});

elements.roomForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const room = await request('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ name: elements.roomInput.value }),
    });

    elements.roomInput.value = '';
    await joinRoom(room.id);
  } catch (error) {
    showNotice(error.message);
  }
});

elements.renameRoom.addEventListener('click', async () => {
  if (!state.currentRoom) {
    showNotice('Choose a room first');

    return;
  }

  const name = prompt('Rename room', state.currentRoom.name);

  if (name === null) {
    return;
  }

  try {
    const room = await request(`/api/rooms/${state.currentRoom.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });

    state.currentRoom = room;
    renderMessages();
    showNotice();
  } catch (error) {
    showNotice(error.message);
  }
});

elements.deleteRoom.addEventListener('click', async () => {
  if (!state.currentRoom) {
    showNotice('Choose a room first');

    return;
  }

  if (!confirm(`Delete "${state.currentRoom.name}"?`)) {
    return;
  }

  try {
    await request(`/api/rooms/${state.currentRoom.id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    showNotice(error.message);
  }
});

elements.messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!state.username) {
    showNotice('Save your username first');

    return;
  }

  if (!state.currentRoom) {
    showNotice('Choose a room first');

    return;
  }

  try {
    await request(`/api/rooms/${state.currentRoom.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        author: state.username,
        text: elements.messageInput.value,
      }),
    });

    elements.messageInput.value = '';
    showNotice();
  } catch (error) {
    showNotice(error.message);
  }
});

const events = new EventSource('/events');

events.addEventListener('rooms', (event) => {
  syncRooms(JSON.parse(event.data));
});

events.addEventListener('room-deleted', (event) => {
  const data = JSON.parse(event.data);

  if (state.currentRoom && state.currentRoom.id === data.roomId) {
    state.currentRoom = null;
    localStorage.removeItem(ROOM_KEY);
  }

  syncRooms(data.state);
});

events.addEventListener('message', async (event) => {
  const data = JSON.parse(event.data);

  syncRooms(data.state);

  if (state.currentRoom && state.currentRoom.id === data.roomId) {
    await joinRoom(data.roomId);
  }
});

loadState().catch((error) => showNotice(error.message));
