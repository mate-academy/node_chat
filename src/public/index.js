/* eslint-disable function-paren-newline */
/* eslint-disable no-console */
/* eslint-disable no-undef */
const socket = new WebSocket('ws://localhost:5000');

socket.addEventListener('open', () => {
  console.log('[WS] Connection opened');
});

socket.addEventListener('close', () => {
  console.log('[WS] Connection closed');
});

socket.addEventListener('error', (e) => {
  console.error('[WS] Error:', e);
});

const usernameForm = document.getElementById('usernameForm');
const usernameInput = document.getElementById('usernameInput');
const mainUI = document.getElementById('mainUI');
const roomList = document.getElementById('roomList');
const newRoomInput = document.getElementById('newRoomInput');
const createRoomBtn = document.getElementById('createRoomBtn');
const chatSection = document.getElementById('chatSection');
const welcomeUser = document.getElementById('welcomeUser');
const messagesDiv = document.getElementById('messages');
const sendMessageForm = document.getElementById('sendMessageForm');
const messageInput = document.getElementById('messageInput');

let username = '';
let currentRoom = null;

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'rooms_list':
      updateRoomList(data.rooms);
      break;
    case 'room_history':
      renderMessages(data.messages);
      break;
    case 'new_message':
      addMessage(data.message);
      break;
  }
};

usernameForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (usernameInput.value.trim()) {
    username = usernameInput.value.trim();

    console.log('socket.readyState:', socket.readyState);

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'set_username', username }));
      initUI();
    } else {
      socket.addEventListener(
        'open',
        () => {
          socket.send(JSON.stringify({ type: 'set_username', username }));
          initUI();
          console.log('Socket open');
        },
        { once: true },
      );
    }
  }
});

createRoomBtn.addEventListener('click', () => {
  const roomName = newRoomInput.value.trim();

  if (roomName) {
    socket.send(JSON.stringify({ type: 'create_room', room: roomName }));
    newRoomInput.value = '';
  }
});

sendMessageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (text) {
    socket.send(JSON.stringify({ type: 'send_message', text }));
    messageInput.value = '';
  }
});

function initUI() {
  usernameForm.style.display = 'none';
  mainUI.classList.remove('hidden');
  welcomeUser.textContent = `💬 Вітаємо, ${username}!`;
  console.log('initUI called');
}

function updateRoomList(rooms) {
  roomList.innerHTML = '';

  rooms.forEach((room) => {
    const li = document.createElement('li');

    li.textContent = room;
    // eslint-disable-next-line no-console
    console.log('currentRoom:', currentRoom, '| room:', room);
    li.className = currentRoom === room ? 'active' : '';

    const joinBtn = document.createElement('button');

    joinBtn.textContent = 'Увійти';

    joinBtn.onclick = () => {
      currentRoom = room;
      chatSection.classList.remove('hidden');
      socket.send(JSON.stringify({ type: 'join_room', room }));

      updateRoomList(
        [...roomList.children].map((l) =>
          l.textContent.split('Увійти')[0].trim(),
        ),
      );
    };

    li.appendChild(joinBtn);
    roomList.appendChild(li);
  });
}

function renderMessages(messages) {
  messagesDiv.innerHTML = '';
  messages.forEach(addMessage);
}

function addMessage(msg) {
  const div = document.createElement('div');

  div.className = 'message';

  div.innerHTML = `<strong>${msg.author}:</strong> ${msg.text}
    <span class="timestamp">${new Date(msg.time).toLocaleTimeString()}</span>`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
