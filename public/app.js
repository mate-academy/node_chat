/* eslint-env browser */
const ws = new WebSocket(`ws://${window.location.host}`);

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const chatScreen = document.getElementById('chat-screen');
const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username-input');
const currentUsernameSpan = document.getElementById('current-username');

const roomsListEl = document.getElementById('rooms-list');
const mainChatArea = document.getElementById('main-chat-area');
const currentRoomNameEl = document.getElementById('current-room-name');
const roomActions = document.getElementById('room-actions');
const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// Modals
const createRoomModal = document.getElementById('create-room-modal');
const renameRoomModal = document.getElementById('rename-room-modal');
const newRoomNameInput = document.getElementById('new-room-name');
const renameRoomInput = document.getElementById('rename-room-input');

// State
let username = localStorage.getItem('username');
let currentRoomId = null;

ws.onopen = () => {
  // eslint-disable-next-line no-console
  console.log('Connected to server');

  if (username) {
    joinApp(username);
  }
};

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);

  switch (data.type) {
    case 'ROOMS_LIST':
      renderRoomsList(data.payload);
      break;

    case 'ROOM_STATE':
      currentRoomId = data.payload.roomId;
      currentRoomNameEl.textContent = data.payload.name;
      mainChatArea.classList.remove('hidden');
      roomActions.classList.remove('hidden');
      renderMessages(data.payload.messages);
      highlightCurrentRoom();
      break;

    case 'NEW_MESSAGE':
      if (data.payload.roomId === currentRoomId) {
        appendMessage(data.payload.message);
        scrollToBottom();
      }
      break;

    case 'ROOM_DELETED':
      if (data.payload === currentRoomId) {
        currentRoomId = null;
        mainChatArea.classList.add('hidden');
        alert('The room was deleted.');
      }
      break;
  }
};

// Auth
authForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const val = usernameInput.value.trim();

  if (val) {
    localStorage.setItem('username', val);
    username = val;
    joinApp(val);
  }
});

function joinApp(userName) {
  ws.send(JSON.stringify({ type: 'SET_USERNAME', payload: userName }));
  currentUsernameSpan.textContent = userName;
  authScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
}

// Rooms Management
function renderRoomsList(rooms) {
  roomsListEl.innerHTML = '';

  rooms.forEach((room) => {
    const li = document.createElement('li');

    li.textContent = room.name;
    li.dataset.id = room.id;

    if (room.id === currentRoomId) {
      li.classList.add('active');
    }

    li.addEventListener('click', () => {
      ws.send(JSON.stringify({ type: 'JOIN_ROOM', payload: room.id }));
    });
    roomsListEl.appendChild(li);
  });
}

function highlightCurrentRoom() {
  document.querySelectorAll('#rooms-list li').forEach((li) => {
    if (li.dataset.id === currentRoomId) {
      li.classList.add('active');
    } else {
      li.classList.remove('active');
    }
  });
}

// Create Room
document.getElementById('create-room-btn').addEventListener('click', () => {
  createRoomModal.classList.remove('hidden');
  newRoomNameInput.focus();
});

document.getElementById('cancel-create-room').addEventListener('click', () => {
  createRoomModal.classList.add('hidden');
  newRoomNameInput.value = '';
});

document.getElementById('confirm-create-room').addEventListener('click', () => {
  const val = newRoomNameInput.value.trim();

  if (val) {
    ws.send(JSON.stringify({ type: 'CREATE_ROOM', payload: val }));
    createRoomModal.classList.add('hidden');
    newRoomNameInput.value = '';
  }
});

// Rename Room
document.getElementById('rename-room-btn').addEventListener('click', () => {
  renameRoomInput.value = currentRoomNameEl.textContent;
  renameRoomModal.classList.remove('hidden');
  renameRoomInput.focus();
});

document.getElementById('cancel-rename-room').addEventListener('click', () => {
  renameRoomModal.classList.add('hidden');
});

document.getElementById('confirm-rename-room').addEventListener('click', () => {
  const val = renameRoomInput.value.trim();

  if (val && currentRoomId) {
    ws.send(
      JSON.stringify({
        type: 'RENAME_ROOM',
        payload: { roomId: currentRoomId, newName: val },
      }),
    );
    currentRoomNameEl.textContent = val;
    renameRoomModal.classList.add('hidden');
  }
});

// Delete Room
document.getElementById('delete-room-btn').addEventListener('click', () => {
  if (currentRoomId && confirm('Are you sure you want to delete this room?')) {
    ws.send(JSON.stringify({ type: 'DELETE_ROOM', payload: currentRoomId }));
  }
});

// Messaging
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const val = messageInput.value.trim();

  if (val && currentRoomId) {
    ws.send(JSON.stringify({ type: 'SEND_MESSAGE', payload: val }));
    messageInput.value = '';
  }
});

function renderMessages(messages) {
  messagesContainer.innerHTML = '';
  messages.forEach(appendMessage);
  scrollToBottom();
}

function appendMessage(msg) {
  const div = document.createElement('div');

  div.className = `message ${msg.author === username ? 'own' : ''}`;

  const time = new Date(msg.time).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  div.innerHTML = `
        <div class="message-header">
            <span>${msg.author}</span>
            <span>${time}</span>
        </div>
        <div class="message-text">${escapeHTML(msg.text)}</div>
    `;
  messagesContainer.appendChild(div);
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[tag] || tag,
  );
}
