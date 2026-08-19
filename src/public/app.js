'use strict';

/* global localStorage */

const USERNAME_KEY = 'nodeChatUsername';
const POLL_INTERVAL_MS = 1000;

const loginSection = document.querySelector('[data-login]');
const loginForm = document.querySelector('[data-login-form]');
const loginFeedback = document.querySelector('[data-login-feedback]');
const chatSection = document.querySelector('[data-chat]');
const userLabel = document.querySelector('[data-user]');
const changeUserButton = document.querySelector('[data-change-user]');
const roomForm = document.querySelector('[data-room-form]');
const roomFeedback = document.querySelector('[data-room-feedback]');
const roomsList = document.querySelector('[data-rooms]');
const roomTitle = document.querySelector('[data-room-title]');
const messagesList = document.querySelector('[data-messages]');
const messageForm = document.querySelector('[data-message-form]');
const messageFeedback = document.querySelector('[data-message-feedback]');
const connectionLabel = document.querySelector('[data-connection]');

const state = {
  activeRoomId: 'general',
  username: '',
  rooms: [],
};

let pollTimer = null;
let lastMessagesFingerprint = '';

function setFeedback(element, message) {
  element.textContent = message;
}

async function requestJson(url, options = {}) {
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
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (typeof text === 'string') {
    element.textContent = text;
  }

  return element;
}

function formatTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderMessages(messages) {
  const fingerprint = JSON.stringify(messages);

  if (fingerprint === lastMessagesFingerprint) {
    return;
  }

  lastMessagesFingerprint = fingerprint;
  messagesList.replaceChildren();

  if (messages.length === 0) {
    messagesList.append(
      createElement('li', 'empty', 'No messages yet. Start the conversation.'),
    );

    return;
  }

  messages.forEach((message) => {
    const item = createElement('li', 'message');
    const meta = createElement('div', 'message__meta');
    const author = createElement('strong', '', message.author);
    const time = createElement('time', '', formatTime(message.time));
    const text = createElement('p', 'message__text', message.text);

    time.dateTime = message.time;
    meta.append(author, time);
    item.append(meta, text);
    messagesList.append(item);
  });

  messagesList.scrollTop = messagesList.scrollHeight;
}

function getActiveRoom() {
  return state.rooms.find((room) => room.id === state.activeRoomId);
}

async function loadActiveRoom() {
  if (!state.activeRoomId) {
    return;
  }

  try {
    const data = await requestJson(
      `/rooms/${encodeURIComponent(state.activeRoomId)}`,
    );

    connectionLabel.textContent = 'Connected';
    roomTitle.textContent = data.room.name;
    renderMessages(data.room.messages);
  } catch (error) {
    connectionLabel.textContent = 'Retrying…';

    if (error.message === 'Room not found') {
      state.activeRoomId = 'general';
      lastMessagesFingerprint = '';
      await loadRooms();
    }
  }
}

async function setActiveRoom(roomId) {
  state.activeRoomId = roomId;
  lastMessagesFingerprint = '';
  renderRooms();
  await loadActiveRoom();
}

function createRenameForm(room, item) {
  const form = createElement('form', 'room room--editing');
  const input = createElement('input');
  const saveButton = createElement('button', 'room__action', '✓');
  const cancelButton = createElement('button', 'room__action', '×');

  input.name = 'name';
  input.value = room.name;
  input.maxLength = 60;
  input.required = true;
  saveButton.type = 'submit';
  saveButton.title = 'Save room name';
  cancelButton.type = 'button';
  cancelButton.title = 'Cancel rename';

  form.append(input, saveButton, cancelButton);
  item.replaceWith(form);
  input.focus();
  input.select();

  cancelButton.addEventListener('click', () => {
    renderRooms();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = input.value.trim();

    if (!name) {
      setFeedback(roomFeedback, 'Room name is required.');

      return;
    }

    try {
      setFeedback(roomFeedback, '');

      await requestJson(`/rooms/${encodeURIComponent(room.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      await loadRooms();
      await loadActiveRoom();
    } catch (error) {
      setFeedback(roomFeedback, error.message);
    }
  });
}

async function deleteRoom(room) {
  if (room.id === 'general') {
    return;
  }

  try {
    setFeedback(roomFeedback, '');

    const data = await requestJson(`/rooms/${encodeURIComponent(room.id)}`, {
      method: 'DELETE',
    });

    if (state.activeRoomId === room.id) {
      state.activeRoomId = data.fallbackRoomId;
      lastMessagesFingerprint = '';
    }

    await loadRooms();
    await loadActiveRoom();
  } catch (error) {
    setFeedback(roomFeedback, error.message);
  }
}

function renderRooms() {
  roomsList.replaceChildren();

  state.rooms.forEach((room) => {
    const item = createElement('li', 'room');
    const openButton = createElement('button', 'room__open', room.name);
    const renameButton = createElement('button', 'room__action', '✎');
    const deleteButton = createElement('button', 'room__action', '×');

    openButton.type = 'button';
    renameButton.type = 'button';
    deleteButton.type = 'button';
    openButton.classList.toggle('is-active', room.id === state.activeRoomId);
    renameButton.title = `Rename ${room.name}`;
    deleteButton.title = `Delete ${room.name}`;
    deleteButton.disabled = room.id === 'general';

    openButton.addEventListener('click', () => {
      setActiveRoom(room.id);
    });

    renameButton.addEventListener('click', () => {
      createRenameForm(room, item);
    });

    deleteButton.addEventListener('click', () => {
      deleteRoom(room);
    });

    item.append(openButton, renameButton, deleteButton);
    roomsList.append(item);
  });
}

async function loadRooms() {
  try {
    const data = await requestJson('/rooms');

    state.rooms = data.rooms;

    if (!getActiveRoom()) {
      state.activeRoomId = 'general';
      lastMessagesFingerprint = '';
    }

    renderRooms();
  } catch (error) {
    setFeedback(roomFeedback, error.message);
  }
}

function startPolling() {
  if (pollTimer !== null) {
    window.clearInterval(pollTimer);
  }

  pollTimer = window.setInterval(() => {
    loadActiveRoom();
  }, POLL_INTERVAL_MS);
}

async function enterChat(username) {
  state.username = username.trim();
  localStorage.setItem(USERNAME_KEY, state.username);
  userLabel.textContent = state.username;
  loginSection.classList.add('is-hidden');
  chatSection.classList.remove('is-hidden');
  await loadRooms();
  await loadActiveRoom();
  startPolling();
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const username = formData.get('username');

  if (typeof username !== 'string' || !username.trim()) {
    setFeedback(loginFeedback, 'Username is required.');

    return;
  }

  setFeedback(loginFeedback, '');
  enterChat(username);
});

changeUserButton.addEventListener('click', () => {
  localStorage.removeItem(USERNAME_KEY);
  state.username = '';

  if (pollTimer !== null) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }

  chatSection.classList.add('is-hidden');
  loginSection.classList.remove('is-hidden');
  loginForm.elements.username.focus();
});

roomForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(roomForm);
  const name = formData.get('name');

  if (typeof name !== 'string' || !name.trim()) {
    setFeedback(roomFeedback, 'Room name is required.');

    return;
  }

  try {
    setFeedback(roomFeedback, '');

    const data = await requestJson('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });

    roomForm.reset();
    await loadRooms();
    await setActiveRoom(data.room.id);
  } catch (error) {
    setFeedback(roomFeedback, error.message);
  }
});

messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(messageForm);
  const text = formData.get('text');

  if (typeof text !== 'string' || !text.trim()) {
    setFeedback(messageFeedback, 'Message cannot be empty.');

    return;
  }

  try {
    setFeedback(messageFeedback, '');

    await requestJson(
      `/rooms/${encodeURIComponent(state.activeRoomId)}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          author: state.username,
          text,
        }),
      },
    );

    messageForm.reset();
    lastMessagesFingerprint = '';
    await loadActiveRoom();
  } catch (error) {
    setFeedback(messageFeedback, error.message);
  }
});

const savedUsername = localStorage.getItem(USERNAME_KEY);

if (savedUsername && savedUsername.trim()) {
  enterChat(savedUsername);
} else {
  loginForm.elements.username.focus();
}
