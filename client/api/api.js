/* global io, EVENTS */

const state = {
  username: window.localStorage.getItem('username') || '',
  roomId: null,
};

const socket = io();

const authContainer = document.getElementById('auth-container');
const usernameInput = document.getElementById('username');
const roomNameInput = document.getElementById('room-name');
const createRoomBtn = document.getElementById('create-room-btn');
const roomsList = document.getElementById('rooms-list');

const chatWindow = document.getElementById('chat-window');
const currentRoomTitle = document.querySelector('#current-room-title span');
const messagesLog = document.getElementById('messages-log');

const messageInput = document.getElementById('message-text');
const sendBtn = document.getElementById('send-btn');

if (state.username) {
  usernameInput.value = state.username;
}

function saveUsername(username) {
  state.username = username;
  window.localStorage.setItem('username', username);
}

function renderMessage({ author, text, time }) {
  const div = document.createElement('div');

  div.className = 'message';

  div.innerHTML = `
    <strong>${author}</strong>
    <span style="font-size: 0.8em; color: gray;">${new Date(time).toLocaleTimeString()}</span>
    <div>${text}</div>
  `;

  messagesLog.appendChild(div);
  messagesLog.scrollTop = messagesLog.scrollHeight;
}

function clearChat() {
  messagesLog.innerHTML = '';
}

createRoomBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const roomName = roomNameInput.value.trim();

  if (!username || !roomName) {
    window.alert('Введи імʼя та назву кімнати');

    return;
  }

  saveUsername(username);

  socket.emit(EVENTS.ROOM_CREATE, {
    name: roomName,
    owner: username,
  });
});

function joinRoom(roomId, roomName) {
  const username = usernameInput.value.trim();

  if (!username) {
    window.alert('Введи імʼя');

    return;
  }

  saveUsername(username);

  state.roomId = roomId;

  socket.emit(EVENTS.ROOM_JOIN, {
    roomId,
    username,
  });

  authContainer.style.display = 'none';
  chatWindow.style.display = 'block';
  currentRoomTitle.textContent = roomName;

  clearChat();
}

sendBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

  socket.emit(EVENTS.MSG_SEND, { text });
  messageInput.value = '';
});

socket.on(EVENTS.MSG_HISTORY, (messages) => {
  clearChat();
  messages.forEach(renderMessage);
});

socket.on(EVENTS.MSG_NEW, (message) => {
  renderMessage(message);
});

socket.on(EVENTS.ERROR, (msg) => {
  window.alert(msg);
});

socket.on(EVENTS.ROOM_LIST, (rooms) => {
  roomsList.innerHTML = '';

  rooms.forEach((room) => {
    const li = document.createElement('li');

    const title = document.createElement('span');

    title.textContent = room.name;

    const joinBtn = document.createElement('button');

    joinBtn.textContent = 'Увійти';
    joinBtn.style.marginLeft = '10px';
    joinBtn.onclick = () => joinRoom(room.id, room.name);

    const renameBtn = document.createElement('button');

    renameBtn.textContent = 'Rename';
    renameBtn.style.marginLeft = '5px';

    renameBtn.onclick = () => {
      const newName = window.prompt('Нова назва кімнати', room.name);

      if (newName) {
        socket.emit(EVENTS.ROOM_RENAME, {
          roomId: room.id,
          newName,
        });
      }
    };

    const deleteBtn = document.createElement('button');

    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '5px';

    deleteBtn.onclick = () => {
      const confirmed = window.confirm('Видалити кімнату?');

      if (confirmed) {
        socket.emit(EVENTS.ROOM_DELETE, {
          roomId: room.id,
        });
      }
    };

    li.appendChild(title);
    li.appendChild(joinBtn);
    li.appendChild(renameBtn);
    li.appendChild(deleteBtn);

    roomsList.appendChild(li);
  });
});
