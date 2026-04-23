'use strict';
/* eslint-env browser */

const state = {
  username: localStorage.getItem('chat:username') || '',
  rooms: [],
  activeRoomId: null,
  activeMessages: [],
};
let socket = null;

const authSection = document.querySelector('#authSection');
const chatSection = document.querySelector('#chatSection');
const usernameForm = document.querySelector('#usernameForm');
const usernameInput = document.querySelector('#usernameInput');
const currentUserLabel = document.querySelector('#currentUserLabel');
const createRoomButton = document.querySelector('#createRoomButton');
const renameRoomButton = document.querySelector('#renameRoomButton');
const deleteRoomButton = document.querySelector('#deleteRoomButton');
const roomsList = document.querySelector('#roomsList');
const currentRoomTitle = document.querySelector('#currentRoomTitle');
const messagesList = document.querySelector('#messagesList');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#messageInput');

function getActiveRoom() {
  return state.rooms.find((room) => room.id === state.activeRoomId) || null;
}

function syncRoomActionButtons() {
  const activeRoom = getActiveRoom();
  const hasActiveRoom = Boolean(activeRoom);
  const isGeneralRoom = activeRoom?.name?.toLowerCase() === 'general';

  renameRoomButton.disabled = !hasActiveRoom;
  deleteRoomButton.disabled = !hasActiveRoom || isGeneralRoom;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function renderAuthState() {
  const isAuthorized = Boolean(state.username);

  authSection.classList.toggle('hidden', isAuthorized);
  chatSection.classList.toggle('hidden', !isAuthorized);
  currentUserLabel.textContent = isAuthorized ? `User: ${state.username}` : '';
}

function renderRooms() {
  roomsList.innerHTML = '';

  state.rooms.forEach((room) => {
    const listItem = document.createElement('li');
    const roomButton = document.createElement('button');

    roomButton.type = 'button';
    roomButton.className = `room-item ${room.id === state.activeRoomId ? 'active' : ''}`;
    roomButton.textContent = `${room.name} (${room.messagesCount})`;

    roomButton.addEventListener('click', () => {
      joinRoom(room.id);
    });

    listItem.append(roomButton);
    roomsList.append(listItem);
  });

  syncRoomActionButtons();
}

function renderMessages(messages) {
  messagesList.innerHTML = '';

  if (messages.length === 0) {
    const emptyMessage = document.createElement('li');

    emptyMessage.textContent = 'No messages yet';
    messagesList.append(emptyMessage);

    return;
  }

  messages.forEach((message) => {
    const listItem = createMessageItem(message);

    messagesList.append(listItem);
  });

  messagesList.scrollTop = messagesList.scrollHeight;
}

function createMessageItem(message) {
  const listItem = document.createElement('li');
  const meta = document.createElement('div');
  const text = document.createElement('div');

  listItem.className = 'message';
  meta.className = 'message-meta';
  meta.textContent = `${message.author} at ${new Date(message.time).toLocaleString()}`;
  text.textContent = message.text;

  listItem.append(meta, text);

  return listItem;
}

function appendMessage(message) {
  if (messagesList.textContent === 'No messages yet') {
    messagesList.innerHTML = '';
  }

  const listItem = createMessageItem(message);

  messagesList.append(listItem);
  messagesList.scrollTop = messagesList.scrollHeight;
}

function isSameMessage(leftMessage, rightMessage) {
  if (leftMessage?.id && rightMessage?.id) {
    return leftMessage.id === rightMessage.id;
  }

  return (
    leftMessage?.author === rightMessage?.author &&
    leftMessage?.text === rightMessage?.text &&
    leftMessage?.time === rightMessage?.time
  );
}

async function loadRooms() {
  const data = await request('/api/rooms');

  state.rooms = data.rooms;

  if (!state.rooms.some((room) => room.id === state.activeRoomId)) {
    state.activeRoomId = state.rooms[0]?.id || null;
  }

  renderRooms();
}

function updateRoomsFromSocket(rooms, deletedRoomId = null) {
  const previousActiveRoomId = state.activeRoomId;

  state.rooms = rooms;

  if (deletedRoomId && state.activeRoomId === deletedRoomId) {
    state.activeRoomId = null;
  }

  if (!state.rooms.some((room) => room.id === state.activeRoomId)) {
    state.activeRoomId = state.rooms[0]?.id || null;
  }

  renderRooms();

  return previousActiveRoomId !== state.activeRoomId;
}

async function loadMessages() {
  if (!state.activeRoomId) {
    state.activeMessages = [];
    renderMessages(state.activeMessages);
    currentRoomTitle.textContent = 'Room';

    return;
  }

  const room = state.rooms.find((item) => item.id === state.activeRoomId);
  const data = await request(`/api/rooms/${state.activeRoomId}/messages`);

  currentRoomTitle.textContent = room?.name || 'Room';
  state.activeMessages = data.messages;
  renderMessages(state.activeMessages);
}

async function joinRoom(roomId) {
  state.activeRoomId = roomId;
  renderRooms();
  await loadMessages();
}

function connectWebSocket() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

  socket = new WebSocket(`${protocol}://${window.location.host}`);

  socket.addEventListener('message', async (messageEvent) => {
    try {
      const payload = JSON.parse(messageEvent.data);

      if (payload.type === 'rooms_updated') {
        const activeRoomChanged = updateRoomsFromSocket(
          payload.rooms || [],
          payload.deletedRoomId,
        );

        if (activeRoomChanged) {
          await loadMessages();
        } else {
          const room = getActiveRoom();

          currentRoomTitle.textContent = room?.name || 'Room';
        }
      }

      if (payload.type === 'message_created') {
        state.rooms = payload.rooms || state.rooms;
        renderRooms();

        if (payload.roomId === state.activeRoomId) {
          const lastMessage =
            state.activeMessages[state.activeMessages.length - 1];

          if (!isSameMessage(lastMessage, payload.message)) {
            state.activeMessages.push(payload.message);
            appendMessage(payload.message);
          }
        }
      }
    } catch (error) {
      // Ignore malformed ws payloads.
    }
  });

  socket.addEventListener('close', () => {
    setTimeout(() => {
      if (state.username) {
        connectWebSocket();
      }
    }, 1000);
  });
}

async function initializeChat() {
  renderAuthState();

  if (!state.username) {
    usernameInput.focus();

    return;
  }

  await request('/api/users', {
    method: 'POST',
    body: JSON.stringify({ username: state.username }),
  });

  await loadRooms();
  await loadMessages();
  connectWebSocket();
}

usernameForm.addEventListener('submit', async (submitEvent) => {
  submitEvent.preventDefault();

  const username = usernameInput.value.trim();

  if (!username) {
    return;
  }

  try {
    await request('/api/users', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });

    state.username = username;
    localStorage.setItem('chat:username', username);
    usernameInput.value = '';

    await initializeChat();
  } catch (error) {
    alert(error.message);
  }
});

createRoomButton.addEventListener('click', async () => {
  const roomName = prompt('New room name:');

  if (!roomName || !roomName.trim()) {
    return;
  }

  try {
    const data = await request('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ name: roomName }),
    });

    state.activeRoomId = data.room.id;
    await loadRooms();
    await loadMessages();
  } catch (error) {
    alert(error.message);
  }
});

renameRoomButton.addEventListener('click', async () => {
  if (!state.activeRoomId) {
    return;
  }

  const currentRoom = getActiveRoom();
  const nextName = prompt('Rename room to:', currentRoom?.name || '');

  if (!nextName || !nextName.trim()) {
    return;
  }

  try {
    await request(`/api/rooms/${state.activeRoomId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: nextName }),
    });

    await loadRooms();
    await loadMessages();
  } catch (error) {
    alert(error.message);
  }
});

deleteRoomButton.addEventListener('click', async () => {
  if (!state.activeRoomId) {
    return;
  }

  const currentRoom = getActiveRoom();

  if (currentRoom?.name?.toLowerCase() === 'general') {
    alert('General room cannot be deleted');

    return;
  }

  const shouldDelete = confirm('Delete this room?');

  if (!shouldDelete) {
    return;
  }

  try {
    await request(`/api/rooms/${state.activeRoomId}`, {
      method: 'DELETE',
    });

    state.activeRoomId = null;
    await loadRooms();
    await loadMessages();
  } catch (error) {
    alert(error.message);
  }
});

messageForm.addEventListener('submit', async (submitEvent) => {
  submitEvent.preventDefault();

  if (!state.activeRoomId) {
    return;
  }

  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

  try {
    await request(`/api/rooms/${state.activeRoomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        author: state.username,
        text,
      }),
    });

    messageInput.value = '';
  } catch (error) {
    alert(error.message);
  }
});

initializeChat().catch((error) => {
  alert(error.message);
});
