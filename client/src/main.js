import './styles/main.scss';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

let rooms = [];
let currentRoomId = null;

const savedUsername = window.localStorage.getItem('username');

document.querySelector('#app').innerHTML = `
  <main>
    <section id="username-section">
      <h1>Chat</h1>

      <form id="username-form">
        <label for="username">
          Username
        </label>

        <input
          id="username"
          type="text"
          placeholder="Enter username"
          value="${savedUsername || ''}"
        />

        <button type="submit">
          Join chat
        </button>
      </form>

      <p id="username-message"></p>
    </section>

    <section id="chat-section" hidden>
      <header>
        <h1>Chat</h1>

        <p>
          Signed in as:
          <strong id="current-user"></strong>
        </p>
      </header>

      <aside>
        <h2>Rooms</h2>

        <form id="create-room-form">
          <input
            id="room-name"
            type="text"
            placeholder="Room name"
          />

          <button type="submit">
            Create
          </button>
        </form>

        <ul id="rooms-list"></ul>
      </aside>

      <section>
        <h2 id="current-room-name">
          Select a room
        </h2>

        <p id="room-message">
          Join a room to start chatting.
        </p>

        <div id="messages"></div>

        <form id="message-form" hidden>
          <input
            id="message-input"
            type="text"
            placeholder="Type a message..."
            autocomplete="off"
          />

          <button type="submit">
            Send
          </button>
        </form>
      </section>
    </section>
  </main>
`;

const usernameSection = document.querySelector('#username-section');

const chatSection = document.querySelector('#chat-section');

const usernameForm = document.querySelector('#username-form');

const usernameInput = document.querySelector('#username');

const usernameMessage = document.querySelector('#username-message');

const currentUser = document.querySelector('#current-user');

const createRoomForm = document.querySelector('#create-room-form');

const roomNameInput = document.querySelector('#room-name');

const roomsList = document.querySelector('#rooms-list');

const currentRoomName = document.querySelector('#current-room-name');

const roomMessage = document.querySelector('#room-message');

const messagesContainer = document.querySelector('#messages');

const messageForm = document.querySelector('#message-form');

const messageInput = document.querySelector('#message-input');

const openChat = (username) => {
  usernameSection.hidden = true;
  chatSection.hidden = false;

  currentUser.textContent = username;
};

const renderMessage = (message) => {
  const messageElement = document.createElement('article');

  const header = document.createElement('div');
  const author = document.createElement('strong');
  const time = document.createElement('time');
  const text = document.createElement('p');

  const date = new Date(message.time);

  author.textContent = message.author;

  time.textContent = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  time.dateTime = message.time;

  text.textContent = message.text;

  header.append(author, time);
  messageElement.append(header, text);

  messagesContainer.append(messageElement);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

const renderRooms = () => {
  roomsList.innerHTML = '';

  rooms.forEach((room) => {
    const item = document.createElement('li');

    if (room.id === currentRoomId) {
      item.classList.add('room--active');
    }

    const name = document.createElement('span');

    name.textContent = room.name;

    const joinButton = document.createElement('button');

    joinButton.type = 'button';

    joinButton.textContent = room.id === currentRoomId ? 'Joined' : 'Join';

    joinButton.disabled = room.id === currentRoomId;

    joinButton.addEventListener('click', () => {
      socket.emit('room:join', room.id);
    });

    const renameButton = document.createElement('button');

    renameButton.type = 'button';
    renameButton.textContent = 'Rename';

    renameButton.addEventListener('click', () => {
      const newName = window.prompt('Enter new room name', room.name);

      if (!newName || !newName.trim()) {
        return;
      }

      socket.emit('room:rename', {
        roomId: room.id,
        name: newName.trim(),
      });
    });

    const deleteButton = document.createElement('button');

    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';

    deleteButton.addEventListener('click', () => {
      const shouldDelete = window.confirm(`Delete room "${room.name}"?`);

      if (!shouldDelete) {
        return;
      }

      socket.emit('room:delete', room.id);
    });

    item.append(name, joinButton, renameButton, deleteButton);

    roomsList.append(item);
  });
};

usernameForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();

  if (!username) {
    usernameMessage.textContent = 'Username is required';

    return;
  }

  socket.emit('user:set', username);
});

createRoomForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const roomName = roomNameInput.value.trim();

  if (!roomName) {
    return;
  }

  socket.emit('room:create', roomName);

  roomNameInput.value = '';
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = messageInput.value.trim();

  if (!text || !currentRoomId) {
    return;
  }

  socket.emit('message:send', text);

  messageInput.value = '';
  messageInput.focus();
});

socket.on('connected', () => {
  if (savedUsername) {
    socket.emit('user:set', savedUsername);
  }
});

socket.on('user:set:success', (username) => {
  window.localStorage.setItem('username', username);

  usernameMessage.textContent = '';

  openChat(username);
});

socket.on('rooms:update', (updatedRooms) => {
  rooms = updatedRooms;

  const currentRoomStillExists = rooms.some(
    (room) => room.id === currentRoomId,
  );

  if (currentRoomId && !currentRoomStillExists) {
    currentRoomId = null;

    currentRoomName.textContent = 'Select a room';

    roomMessage.textContent = 'Join a room to start chatting.';

    messagesContainer.innerHTML = '';
    messageForm.hidden = true;
  }

  renderRooms();
});

socket.on('room:joined', (room) => {
  currentRoomId = room.id;

  renderRooms();

  currentRoomName.textContent = room.name;

  roomMessage.textContent = `Joined ${room.name}`;

  messagesContainer.innerHTML = '';

  room.messages.forEach((message) => {
    renderMessage(message);
  });

  messageForm.hidden = false;
  messageInput.focus();
});

socket.on('message:new', (message) => {
  renderMessage(message);
});
