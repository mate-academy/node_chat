/* eslint-env browser */

import { io } from 'socket.io-client';
import './style.css';

const connectionStatusEl = document.querySelector('#status');
const usernameInputEl = document.querySelector('#username-input');
const saveBtnEl = document.querySelector('#save-btn');
const currentUserEl = document.querySelector('#current-user');

const roomInputEl = document.querySelector('#room-input');
const createRoomBtnEl = document.querySelector('#create-room-btn');
const roomsListEl = document.querySelector('#rooms-list');
const currentRoomEl = document.querySelector('#current-room');

const messagesListEl = document.querySelector('#messages-list');
const messageInputEl = document.querySelector('#message-input');
const sendBtnEl = document.querySelector('#send-btn');

const socket = io('http://localhost:3000');

let currentUsername = localStorage.getItem('username') || '';
let currentRoomId = null;
let rooms = [];

function renderRooms() {
  roomsListEl.innerHTML = '';

  rooms.forEach((room) => {
    const li = document.createElement('li');

    li.className = 'room-item';

    const joinButton = document.createElement('button');

    joinButton.textContent = room.name;
    joinButton.type = 'button';
    joinButton.className = 'room-join-btn';

    if (room.id === currentRoomId) {
      joinButton.disabled = true;
    }

    joinButton.addEventListener('click', () => {
      socket.emit('room:join', { roomId: room.id });
    });

    const renameButton = document.createElement('button');

    renameButton.textContent = 'Rename';
    renameButton.type = 'button';
    renameButton.className = 'room-action-btn';

    renameButton.addEventListener('click', () => {
      const newName = prompt('Enter new room name', room.name);

      if (!newName) {
        return;
      }

      socket.emit('room:rename', {
        roomId: room.id,
        name: newName.trim(),
      });
    });

    li.append(joinButton, renameButton);

    if (room.id !== 'general') {
      const deleteButton = document.createElement('button');

      deleteButton.textContent = 'Delete';
      deleteButton.type = 'button';
      deleteButton.className = 'room-action-btn';

      deleteButton.addEventListener('click', () => {
        const shouldDelete = confirm(`Delete room "${room.name}"?`);

        if (!shouldDelete) {
          return;
        }

        socket.emit('room:delete', { roomId: room.id });
      });

      li.append(deleteButton);
    }

    roomsListEl.append(li);
  });
}

function updateCurrentRoomText() {
  const activeRoom = rooms.find((room) => room.id === currentRoomId);

  currentRoomEl.textContent = activeRoom
    ? `Current room: ${activeRoom.name}`
    : 'Current room: none';
}

function renderMessage(message) {
  const li = document.createElement('li');

  li.className = 'message-item';
  li.textContent = `[${message.time}] ${message.author}: ${message.text}`;

  messagesListEl.append(li);
}

function renderMessages(messages) {
  messagesListEl.innerHTML = '';
  messages.forEach(renderMessage);
}

function setUser(username) {
  currentUsername = username;
  localStorage.setItem('username', username);

  currentUserEl.textContent = `You are: ${username}`;

  usernameInputEl.style.display = 'none';
  saveBtnEl.style.display = 'none';

  socket.emit('user:set', { username });
}

const savedUsername = localStorage.getItem('username');

if (savedUsername) {
  setUser(savedUsername);
}

socket.on('connect', () => {
  connectionStatusEl.textContent = `Connected: ${socket.id}`;

  if (currentUsername) {
    socket.emit('user:set', { username: currentUsername });
  }

  socket.emit('rooms:get');
});

socket.on('disconnect', () => {
  connectionStatusEl.textContent = 'Disconnected';
});

socket.on('rooms:list', (serverRooms) => {
  rooms = serverRooms;

  const roomStillExists = rooms.some((room) => room.id === currentRoomId);

  if (!roomStillExists) {
    currentRoomId = null;
    messagesListEl.innerHTML = '';
  }

  renderRooms();
  updateCurrentRoomText();
});

socket.on('room:joined', ({ roomId }) => {
  currentRoomId = roomId;
  renderRooms();
  updateCurrentRoomText();
});

socket.on('room:history', ({ roomId, messages }) => {
  if (roomId !== currentRoomId) {
    return;
  }

  renderMessages(messages);
});

socket.on('message:new', ({ roomId, message }) => {
  if (roomId !== currentRoomId) {
    return;
  }

  renderMessage(message);
});

socket.on('error:message', ({ message }) => {
  alert(message);
});

saveBtnEl.addEventListener('click', () => {
  const username = usernameInputEl.value.trim();

  if (!username) {
    return;
  }

  setUser(username);
});

createRoomBtnEl.addEventListener('click', () => {
  const roomName = roomInputEl.value.trim();

  if (!roomName) {
    return;
  }

  socket.emit('room:create', { name: roomName });
  roomInputEl.value = '';
});

roomInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    createRoomBtnEl.click();
  }
});

sendBtnEl.addEventListener('click', () => {
  const text = messageInputEl.value.trim();

  if (!text || !currentUsername || !currentRoomId) {
    return;
  }

  socket.emit('message:send', {
    roomId: currentRoomId,
    author: currentUsername,
    text,
  });

  messageInputEl.value = '';
});

messageInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendBtnEl.click();
  }
});