/* eslint-env browser */
/* global io */

const socket = io();

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const roomList = document.getElementById('room-list');
const newRoomInput = document.getElementById('new-room-input');
const createRoomBtn = document.getElementById('create-room-btn');
const currentRoomName = document.getElementById('current-room-name');
const roomActions = document.getElementById('room-actions');
const deleteRoomBtn = document.getElementById('delete-room-btn');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let currentUser = null;
let currentRoom = null;

// Initialize
function init() {
  const savedUser = localStorage.getItem('username');

  if (savedUser) {
    login(savedUser);
  }
}

// Login
loginBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();

  if (username) {
    login(username);
  }
});

function login(username) {
  currentUser = username;
  localStorage.setItem('username', username);
  loginScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  socket.emit('login', username);
}

// Rooms
socket.on('updateRooms', (rooms) => {
  renderRooms(rooms);
});

function renderRooms(rooms) {
  roomList.innerHTML = '';

  rooms.forEach((room) => {
    const li = document.createElement('li');

    li.textContent = room;

    if (room === currentRoom) {
      li.classList.add('active');
    }

    // Add double click to rename (optional feature based on standard UX,
    // but requirements say create/rename/join/delete)
    // Let's add a small delete button or context menu?
    // For simplicity, I'll stick to clicking to join.

    li.addEventListener('click', () => joinRoom(room));
    roomList.appendChild(li);
  });
}

createRoomBtn.addEventListener('click', () => {
  const roomName = newRoomInput.value.trim();

  if (roomName) {
    socket.emit('createRoom', roomName);
    newRoomInput.value = '';
  }
});

function joinRoom(roomName) {
  if (currentRoom === roomName) {
    return;
  }
  currentRoom = roomName;
  currentRoomName.textContent = roomName;
  roomActions.classList.remove('hidden');
  messagesContainer.innerHTML = ''; // Clear previous messages
  socket.emit('joinRoom', roomName);

  // Update active class
  const items = roomList.querySelectorAll('li');

  items.forEach((item) => {
    if (item.textContent === roomName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

deleteRoomBtn.addEventListener('click', () => {
  if (
    currentRoom &&
    confirm(`Are you sure you want to delete room "${currentRoom}"?`)
  ) {
    socket.emit('deleteRoom', currentRoom);
    currentRoom = null;
    currentRoomName.textContent = 'Select a room';
    roomActions.classList.add('hidden');
    messagesContainer.innerHTML = '';
  }
});

const renameBtn = document.createElement('button');

renameBtn.textContent = 'Rename';

renameBtn.onclick = () => {
  const newName = prompt('Enter new room name:', currentRoom);

  if (newName && newName !== currentRoom) {
    socket.emit('renameRoom', { oldName: currentRoom, newName });
  }
};
roomActions.insertBefore(renameBtn, deleteRoomBtn);

// Messages
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const text = messageInput.value.trim();

  if (text && currentRoom) {
    socket.emit('sendMessage', {
      room: currentRoom,
      text,
      author: currentUser,
    });
    messageInput.value = '';
  }
}

socket.on('message', (message) => {
  appendMessage(message);
});

socket.on('roomHistory', (messages) => {
  messagesContainer.innerHTML = '';
  messages.forEach(appendMessage);
  scrollToBottom();
});

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function appendMessage(message) {
  const div = document.createElement('div');

  div.classList.add('message');

  if (message.author === currentUser) {
    div.classList.add('own');
  }

  const time = new Date(message.time).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  div.innerHTML = `
        <div class="author">${escapeHtml(message.author)}</div>
        <div class="text">${escapeHtml(message.text)}</div>
        <div class="time">${time}</div>
    `;

  messagesContainer.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

socket.on('error', (msg) => {
  alert(msg);
});

// Handle room deletion while inside
socket.on('roomDeleted', (roomName) => {
  if (currentRoom === roomName) {
    alert('Current room was deleted.');
    currentRoom = null;
    currentRoomName.textContent = 'Select a room';
    roomActions.classList.add('hidden');
    messagesContainer.innerHTML = '';
  }
});

init();
