'use strict';

let socket = null;
let username = localStorage.getItem('chat_username') || '';
let currentRoom = 'General';
let cachedRooms = ['General'];

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');

const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username-input');

const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesList = document.getElementById('messages-list');

const createRoomForm = document.getElementById('create-room-form');
const newRoomInput = document.getElementById('new-room-input');
const roomsList = document.getElementById('rooms-list');
const currentRoomNameText = document.getElementById('current-room-name');

function initChat() {
  socket = new WebSocket('ws://localhost:3000');

  socket.onopen = () => {
    console.log('Successfully connected to WebSocket server!');
    socket.send(JSON.stringify({ type: 'SET_USERNAME', username: username }));
    socket.send(JSON.stringify({ type: 'JOIN_ROOM', roomName: currentRoom }));
      };

      socket.onmessage = (event) => {
        handleServerMessage(event);
      };

      socket.onclose = () => {
        console.log('Out of connection');
      };
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  username = usernameInput.value.trim();

  if (!username) {
    return;
  }

  localStorage.setItem('chat_username', username);
  loginScreen.style.display = 'none';
  chatScreen.style.display = 'flex';

  initChat();
});

if (username) {
  loginScreen.style.display = 'none';
  chatScreen.style.display = 'flex';
  initChat();
}

function handleServerMessage(event) {
  try {
    const data = JSON.parse(event.data);
    switch(data.type) {
      case 'ROOM_LIST':
        cachedRooms = data.rooms;
        renderRoomsList(cachedRooms);
        break;

        case 'ROOM_HISTORY':
          renderMessagesHistory(data.messages);
          renderRoomsList(cachedRooms);
          break;

          case 'MESSAGE':
            appendSingleMessage(data.message);
            break;

            default:
              console.warn('Uknown type of serversmessage', data.type);
    }
  } catch (err) {
    console.error('Parsingerror from server', err);
  }
}
function renderRoomsList(rooms) {
  roomsList.innerHTML = '';

  rooms.forEach(roomName => {
    const li = document.createElement('li');

    li.className = 'sidebar__list-item';
    li.textContent = roomName;

    if (roomName === currentRoom) {
      li.classList.add('sidebar__list-item--active');
    }

    li.addEventListener('click', () => {
      if (roomName === currentRoom) return;

      currentRoom = roomName;
      currentRoomNameText.textContent = roomName;

      renderRoomsList(cachedRooms);

      socket.send(JSON.stringify({ type: 'JOIN_ROOM', roomName: roomName }));
    });

    roomsList.appendChild(li);
  });
}

function renderMessagesHistory(messages) {
  messagesList.innerHTML = '';

  messages.forEach(msg => {
    appendSingleMessage(msg);
  });

  messagesList.scrollTop = messagesList.scrollHeight;
}

function appendSingleMessage(msg) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';

  if (msg.author === username) {
    messageDiv.classList.add('message--self');
  }

    const headerDiv = document.createElement('div');
  headerDiv.className = 'message__header';
  headerDiv.textContent = `${msg.author} • ${msg.time}`;

  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'message__bubble';
  bubbleDiv.textContent = msg.text;

  messageDiv.appendChild(headerDiv);
  messageDiv.appendChild(bubbleDiv);

  messagesList.appendChild(messageDiv);

   messagesList.scrollTop = messagesList.scrollHeight;
}

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = messageInput.value.trim();
  if (!text || !socket || socket.readyState !== WebSocket.OPEN) {
    return;
      }

      socket.send(JSON.stringify({
        type: 'NEW_MESSAGE',
        text: text
      }));

      messageInput.value = '';
      messageInput.focus();
});

createRoomForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const roomName = newRoomInput.value.trim();
  if (!roomName || !socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify({
    type: 'CREATE_ROOM',
    roomName: roomName
  }))

  newRoomInput.value = '';
});
