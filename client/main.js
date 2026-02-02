import { state } from './state.js';

const socket = io('http://localhost:3000');
const app = document.getElementById('app');
const loginBlock = document.getElementById('login');
const usernameInput = document.getElementById('usernameInput');
const enterNameBtn = document.getElementById('enterNameBtn');
const roomsList = document.getElementById('roomsList');
const newRoomInput = document.getElementById('newRoomInput');
const createRoomBtn = document.getElementById('createRoomBtn');
const roomTitle = document.getElementById('roomTitle');
const messageList = document.getElementById('messageList');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

function renderApp() {
  if (state.user) {
    loginBlock.classList.add('hidden');
    app.classList.remove('hidden');
  } else {
    app.classList.add('hidden');
    loginBlock.classList.remove('hidden');
  }
}

function renderRooms() {
  const rooms = state.rooms;
  roomsList.innerHTML = '';

  rooms.forEach(room => {
    const li = document.createElement('li');
    const roomNameEl = document.createElement('span');
    roomNameEl.textContent = room.name;

    const joinRoomBtn = document.createElement('button');
    joinRoomBtn.textContent = 'Join room';
    joinRoomBtn.addEventListener('click', () => joinRoom(room.id, room.name));

    const renameRoomBtn = document.createElement('button');
    renameRoomBtn.textContent = 'Rename room';
    renameRoomBtn.addEventListener('click', () => {
      const newName = prompt('New room name', room.name);
      if (newName) {
        renameRoom(room.id, newName);
      }
    });

    const deleteRoomBtn = document.createElement('button');
    deleteRoomBtn.textContent = 'Delete room';
    deleteRoomBtn.addEventListener('click', () => deleteRoom(room.id));

    li.appendChild(roomNameEl);
    li.appendChild(joinRoomBtn);
    li.appendChild(renameRoomBtn);
    li.appendChild(deleteRoomBtn);

    roomsList.appendChild(li);
  });
}

function renderChatHeader() {
  if (!state.activeRoom) {
    return;
  }

  roomTitle.textContent = state.activeRoom.name;
}

function renderMessages() {
  const messages = state.messages;
  clearChat();

  messages.forEach(message => renderOneMessage(message));

  messageList.scrollTop = messageList.scrollHeight;
}

function renderOneMessage(message) {
  const messageBlock = document.createElement('div');
  const authorEl = document.createElement('strong');
  const textEl = document.createElement('p');
  const dateEl = document.createElement('span');
  authorEl.textContent = message.authorName;
  textEl.textContent = message.text;
  messageBlock.className = 'message';

  dateEl.textContent = new Date(message.createdAt).toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  messageBlock.appendChild(authorEl);
  messageBlock.appendChild(dateEl);
  messageBlock.appendChild(textEl);

  messageList.appendChild(messageBlock);
}

function saveUsername(name) {
  state.user = name;
  window.localStorage.setItem('username', name);
}

function joinRoom(roomId, roomName) {
  const userName = state.user;

  if (!userName) {
    throw new Error('Username is required');
  }

  state.activeRoom = { id: roomId, name: roomName, };
  state.messages = [];
  renderChatHeader();

  socket.emit('room_join', {
    roomId,
    userName,
  });

  clearChat();
}

function renameRoom(roomId, newName) {
  if (!newName) {
    throw new Error('New room name is required');
  }

  socket.emit('room_rename', {
    roomId,
    newName,
  });
}

function deleteRoom(roomId) {
  socket.emit('room_delete', { roomId })
}

function clearChat() {
  messageList.innerHTML = '';
}

const enterNameBtnHandler = () => {
  const normalizedName = usernameInput.value.trim();

  if (!normalizedName) {
    return;
  }
  saveUsername(normalizedName);
  renderApp();
}

const createRoomHandler = () => {
  const owner = state.user;
  const roomName = newRoomInput.value.trim();

  if (!owner || !roomName) {
    throw new Error('User and room name are required')
  }


  socket.emit('room_create', {
    name: roomName,
    owner,
  });

  newRoomInput.value = '';
};

const sendMessageHandler = () => {
  const text = messageInput.value.trim();

  console.log('CLICK SEND', {
    text,
    activeRoom: state.activeRoom,
  });

  if (!text || !state.activeRoom) {
    return;
  }

  socket.emit('message_send', {
    text,
  });

  messageInput.value = '';
}

socket.on('room_list', (rooms) => {
  state.rooms = rooms;

  renderRooms();
});

socket.on('message_history', (messages) => {
  state.messages = messages;
  renderMessages();
});

socket.on('message_new', message => {
  if (!state.messages) {
    state.messages = [];
  }

  state.messages.push(message);
  renderOneMessage(message);
  messageList.scrollTop = messageList.scrollHeight;
});

socket.on('error_message', message => {
  console.error('SERVER ERROR:', message);
});

createRoomBtn.addEventListener('click', createRoomHandler);
enterNameBtn.addEventListener('click', enterNameBtnHandler);
sendMessageBtn.addEventListener('click', sendMessageHandler)

renderApp();
