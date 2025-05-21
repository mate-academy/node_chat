/* global io, localStorage */
const socket = io('http://localhost:3000');

// DOM елементи
const loginForm = document.getElementById('loginForm');
const chatInterface = document.getElementById('chatInterface');
const usernameInput = document.getElementById('username');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const currentUsername = document.getElementById('currentUsername');
const newRoomNameInput = document.getElementById('newRoomName');
const createRoomBtn = document.getElementById('createRoomBtn');
const roomList = document.getElementById('roomList');
const currentRoomTitle = document.getElementById('currentRoom');
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

let username = localStorage.getItem('username');
let currentRoom = null;

// Перевірка чи користувач вже авторизований
if (username) {
  usernameInput.value = username;
  showChatInterface();
}

// Обробники подій
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
createRoomBtn.addEventListener('click', handleCreateRoom);
sendBtn.addEventListener('click', handleSendMessage);

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSendMessage();
  }
});

// Socket.io обробники подій
socket.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('Підключено до сервера');
});

socket.on('roomList', (rooms) => {
  updateRoomList(rooms);
});

socket.on('newMessage', (message) => {
  if (message.room === currentRoom) {
    addMessageToChat(message);
  }
});

socket.on('messageHistory', (history) => {
  messagesContainer.innerHTML = '';
  history.forEach((message) => addMessageToChat(message));
});

// Функції
function handleLogin() {
  username = usernameInput.value.trim();

  if (username) {
    localStorage.setItem('username', username);
    showChatInterface();
  }
}

function handleLogout() {
  // Видаляємо дані користувача
  localStorage.removeItem('username');
  username = null;
  currentRoom = null;

  // Відключаємо від сервера
  socket.disconnect();

  // Очищаємо інтерфейс
  messagesContainer.innerHTML = '';
  roomList.innerHTML = '';
  currentRoomTitle.textContent = 'Виберіть кімнату';
  messageInput.value = '';

  // Показуємо форму входу
  chatInterface.classList.add('hidden');
  loginForm.classList.remove('hidden');

  // Перепідключаємося до сервера
  socket.connect();
}

function handleCreateRoom() {
  const roomName = newRoomNameInput.value.trim();

  if (roomName) {
    socket.emit('createRoom', roomName);
    newRoomNameInput.value = '';
  }
}

function handleSendMessage() {
  const messageText = messageInput.value.trim();

  if (messageText && currentRoom) {
    const messageData = {
      roomName: currentRoom,
      text: messageText,
      author: username,
      time: new Date().toISOString(),
    };

    socket.emit('sendMessage', messageData);
    messageInput.value = '';
  }
}

function showChatInterface() {
  loginForm.classList.add('hidden');
  chatInterface.classList.remove('hidden');
  currentUsername.textContent = `Користувач: ${username}`;
}

function updateRoomList(rooms) {
  roomList.innerHTML = '';

  rooms.forEach((room) => {
    const roomElement = document.createElement('div');

    roomElement.className = `room-item ${room === currentRoom ? 'active' : ''}`;
    roomElement.textContent = room;
    roomElement.addEventListener('click', () => joinRoom(room));
    roomList.appendChild(roomElement);
  });
}

function joinRoom(roomName) {
  if (currentRoom !== roomName) {
    currentRoom = roomName;
    socket.emit('joinRoom', roomName);
    currentRoomTitle.textContent = `Кімната: ${roomName}`;
    messagesContainer.innerHTML = '';
    updateRoomList(Array.from(roomList.children).map((el) => el.textContent));
  }
}

function addMessageToChat(message) {
  const messageElement = document.createElement('div');

  messageElement.className = 'message';

  messageElement.innerHTML = `
        <span class="author">${message.author}</span>
        <span class="time">${new Date(message.time).toLocaleTimeString()}</span>
        <div class="text">${message.text}</div>
    `;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
