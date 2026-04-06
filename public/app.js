'use strict';

const state = {
  username: localStorage.getItem('chat:username') || '',
  rooms: [],
  currentRoomId: '',
  messages: [],
};

const socket = io();

const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');
const usernameStatus = document.getElementById('username-status');
const roomForm = document.getElementById('room-form');
const roomInput = document.getElementById('room-input');
const roomList = document.getElementById('room-list');
const currentRoomName = document.getElementById('current-room-name');
const messagesContainer = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const feedback = document.getElementById('feedback');

function setFeedback(text, isError = false) {
  feedback.textContent = text;
  feedback.style.color = isError ? 'var(--danger)' : '';
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderUsername() {
  usernameInput.value = state.username;

  usernameStatus.textContent = state.username
    ? `Current user: ${state.username}`
    : 'Choose a username to start chatting';
}

function renderRooms() {
  roomList.innerHTML = '';

  state.rooms.forEach(room => {
    const item = document.createElement('li');
    const joinButton = document.createElement('button');
    const actions = document.createElement('div');
    const renameButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    item.className = 'room-item';

    if (room.id === state.currentRoomId) {
      item.classList.add('active');
    }

    joinButton.className = 'room-name-button';
    joinButton.type = 'button';
    joinButton.textContent = room.name;

    joinButton.addEventListener('click', () => {
      socket.emit('join:room', {
        roomId: room.id,
      });
    });

    actions.className = 'room-actions';

    renameButton.type = 'button';
    renameButton.className = 'secondary';
    renameButton.textContent = 'Rename';
    renameButton.addEventListener('click', async () => {
      const nextName = window.prompt('New room name', room.name);

      if (!nextName) {
        return;
      }

      try {
        await fetch(`/api/rooms/${room.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nextName,
          }),
        });
      } catch (error) {
        setFeedback('Failed to rename room', true);
      }
    });

    deleteButton.type = 'button';
    deleteButton.className = 'danger';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', async () => {
      const isConfirmed = window.confirm(`Delete room "${room.name}"?`);

      if (!isConfirmed) {
        return;
      }

      try {
        const response = await fetch(`/api/rooms/${room.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const payload = await response.json();

          throw new Error(payload.error);
        }
      } catch (error) {
        setFeedback(error.message || 'Failed to delete room', true);
      }
    });

    actions.append(renameButton, deleteButton);
    item.append(joinButton, actions);
    roomList.append(item);
  });

  const activeRoom = state.rooms.find(room => room.id === state.currentRoomId);

  currentRoomName.textContent = activeRoom ? activeRoom.name : 'No room selected';
}

function renderMessages() {
  messagesContainer.innerHTML = '';

  if (!state.messages.length) {
    const emptyState = document.createElement('p');

    emptyState.className = 'empty-state';
    emptyState.textContent = 'No messages yet. Start this room.';
    messagesContainer.append(emptyState);

    return;
  }

  state.messages.forEach(message => {
    const card = document.createElement('article');
    const meta = document.createElement('div');
    const author = document.createElement('strong');
    const time = document.createElement('span');
    const text = document.createElement('p');

    card.className = 'message-card';
    meta.className = 'message-meta';
    text.className = 'message-text';

    author.textContent = message.author;
    time.textContent = formatTime(message.time);
    text.textContent = message.text;

    meta.append(author, time);
    card.append(meta, text);
    messagesContainer.append(card);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function loadInitialState() {
  const response = await fetch('/api/state');
  const payload = await response.json();

  state.rooms = payload.rooms;
  state.currentRoomId = payload.activeRoomId;
  state.messages = payload.messages;

  renderRooms();
  renderMessages();
}

usernameForm.addEventListener('submit', event => {
  event.preventDefault();

  const username = usernameInput.value.trim();

  if (!username) {
    setFeedback('Username is required', true);

    return;
  }

  state.username = username;
  localStorage.setItem('chat:username', username);
  socket.emit('set:username', {
    username,
  });
  renderUsername();
  setFeedback('Username saved');
});

roomForm.addEventListener('submit', async event => {
  event.preventDefault();

  const name = roomInput.value.trim();

  if (!name) {
    return;
  }

  try {
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
      }),
    });
    const room = await response.json();

    roomInput.value = '';
    socket.emit('join:room', {
      roomId: room.id,
    });
  } catch (error) {
    setFeedback('Failed to create room', true);
  }
});

messageForm.addEventListener('submit', event => {
  event.preventDefault();

  const text = messageInput.value.trim();

  if (!state.username) {
    setFeedback('Save a username first', true);

    return;
  }

  if (!text) {
    return;
  }

  socket.emit('message:create', {
    text,
  });
  messageInput.value = '';
});

socket.on('connect', () => {
  if (state.username) {
    socket.emit('set:username', {
      username: state.username,
    });
  }

  if (state.currentRoomId) {
    socket.emit('join:room', {
      roomId: state.currentRoomId,
    });
  }
});

socket.on('username:updated', payload => {
  state.username = payload.username;
  renderUsername();
});

socket.on('rooms:updated', payload => {
  state.rooms = payload.rooms;
  renderRooms();
});

socket.on('room:renamed', payload => {
  if (payload.roomId === state.currentRoomId) {
    currentRoomName.textContent = payload.name;
  }
});

socket.on('room:joined', payload => {
  state.currentRoomId = payload.roomId;
  state.rooms = payload.rooms;
  state.messages = payload.messages;

  renderRooms();
  renderMessages();
});

socket.on('message:created', message => {
  if (message.roomId !== state.currentRoomId) {
    return;
  }

  state.messages.push(message);
  renderMessages();
});

socket.on('chat:error', payload => {
  setFeedback(payload.error, true);
});

loadInitialState()
  .then(() => {
    renderUsername();
    setFeedback('Connected');
  })
  .catch(() => {
    setFeedback('Failed to load chat state', true);
  });
