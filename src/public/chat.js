/* eslint-env browser */
/* global io */

const socket = io();

const usernameScreen = document.getElementById('username-screen');
const roomsScreen = document.getElementById('rooms-screen');
const chatScreen = document.getElementById('chat-screen');

const usernameInput = document.getElementById('username-input');
const usernameBtn = document.getElementById('username-btn');

let username = localStorage.getItem('username');

function showScreen(targetScreen) {
  usernameScreen.classList.add('hidden');
  roomsScreen.classList.add('hidden');
  chatScreen.classList.add('hidden');
  targetScreen.classList.remove('hidden');
}

function init() {
  if (username) {
    showScreen(roomsScreen);
    socket.emit('getRooms');
  } else {
    showScreen(usernameScreen);
  }
}

usernameBtn.addEventListener('click', () => {
  const value = usernameInput.value.trim();

  if (!value) {
    return;
  }
  username = value;
  localStorage.setItem('username', username);
  showScreen(roomsScreen);
  socket.emit('getRooms');
});

const roomsList = document.getElementById('rooms-list');
const newRoomInput = document.getElementById('new-room-input');
const createRoomBtn = document.getElementById('create-room-btn');

let currentRoomId;

function renderRooms(rooms) {
  roomsList.innerHTML = '';

  rooms.forEach((room) => {
    const li = document.createElement('li');

    const nameSpan = document.createElement('span');

    nameSpan.textContent = room.name;

    const joinBtn = document.createElement('button');

    joinBtn.textContent = 'Join';

    joinBtn.addEventListener('click', () => {
      currentRoomId = room._id;
      document.getElementById('room-title').textContent = room.name;
      showScreen(chatScreen);
      socket.emit('joinRoom', room._id);
    });

    const renameBtn = document.createElement('button');

    renameBtn.textContent = 'Rename';

    renameBtn.addEventListener('click', () => {
      const newName = prompt('New room name:', room.name);

      if (newName && newName.trim()) {
        socket.emit('renameRoom', { roomId: room._id, name: newName.trim() });
      }
    });

    const deleteBtn = document.createElement('button');

    deleteBtn.textContent = 'Delete';

    deleteBtn.addEventListener('click', () => {
      socket.emit('deleteRoom', room._id);
    });

    li.append(nameSpan, joinBtn, renameBtn, deleteBtn);
    roomsList.appendChild(li);
  });
}

socket.on('roomsList', renderRooms);

createRoomBtn.addEventListener('click', () => {
  const roomName = newRoomInput.value.trim();

  if (!roomName) {
    return;
  }
  socket.emit('createRoom', roomName);
  newRoomInput.value = '';
});

const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const leaveRoomBtn = document.getElementById('leave-room-btn');

function renderMessage(message) {
  const div = document.createElement('div');

  div.classList.add('message');

  const authorSpan = document.createElement('span');

  authorSpan.classList.add('author');
  authorSpan.textContent = message.author;

  const timeSpan = document.createElement('span');

  timeSpan.classList.add('time');
  timeSpan.textContent = new Date(message.time).toLocaleTimeString();

  const textDiv = document.createElement('div');

  textDiv.textContent = message.text;

  div.append(authorSpan, timeSpan, textDiv);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

socket.on('roomHistory', (messages) => {
  messagesEl.innerHTML = '';
  messages.forEach(renderMessage);
});

socket.on('newMessage', renderMessage);

sendMessageBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();

  if (!text || !currentRoomId) {
    return;
  }
  socket.emit('sendMessage', { roomId: currentRoomId, author: username, text });
  messageInput.value = '';
});

leaveRoomBtn.addEventListener('click', () => {
  currentRoomId = null;
  showScreen(roomsScreen);
  socket.emit('getRooms');
});

init();
