'use strict';

/* global io, localStorage, prompt */

const socket = io();

const roomForm = document.getElementById('room-form');
const roomNameInput = document.getElementById('room-name');
const roomsListEl = document.getElementById('rooms-list');
const messageForm = document.getElementById('message-form');
const userNameInput = document.getElementById('user-name');
const messageTextInput = document.getElementById('message-text');
const messageListEl = document.getElementById('message-list');

const DEFAULT_ROOM = 'general';

let rooms = [];
let currentRoom = DEFAULT_ROOM;

userNameInput.value = localStorage.getItem('username') || '';

function createButton(className, text, title, onClick) {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = className;
  button.textContent = text;

  if (title) {
    button.title = title;
  }
  button.addEventListener('click', onClick);

  return button;
}

function renderMessage(message) {
  const item = document.createElement('li');
  const author = document.createElement('strong');

  author.textContent = message.userName;
  item.append(`${message.time} `, author, `: ${message.text}`);
  messageListEl.append(item);
}

function renderMessages(messages) {
  messageListEl.innerHTML = '';
  messages.forEach(renderMessage);
}

function joinRoom(roomName) {
  currentRoom = roomName;
  socket.emit('joinRoom', roomName);
  renderRooms();
}

function renameRoom(oldName) {
  const newName = prompt('Enter a new room name:', oldName);

  if (newName && newName.trim() && newName.trim() !== oldName) {
    socket.emit('renameRoom', { oldName, newName: newName.trim() });
  }
}

function renderRooms() {
  roomsListEl.innerHTML = '';

  rooms.forEach((roomName) => {
    const item = document.createElement('div');
    const isActive = roomName === currentRoom;
    const selectClass = `button room-select${isActive ? ' is-info' : ''}`;

    item.className = `room-item${isActive ? ' is-active' : ''}`;

    const selectBtn = createButton(selectClass, roomName, '', () => {
      joinRoom(roomName);
    });

    const renameBtn = createButton(
      'button is-small is-warning',
      '✏️',
      'Rename',
      () => {
        renameRoom(roomName);
      },
    );

    item.append(selectBtn, renameBtn);

    if (roomName !== DEFAULT_ROOM) {
      const deleteBtn = createButton(
        'button is-small is-danger',
        '❌',
        'Delete',
        () => {
          socket.emit('deleteRoom', roomName);
        },
      );

      item.append(deleteBtn);
    }

    roomsListEl.append(item);
  });
}

roomForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const roomName = roomNameInput.value.trim();

  if (!roomName) {
    return;
  }

  socket.emit('createRoom', roomName);
  roomNameInput.value = '';
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const userName = userNameInput.value.trim();
  const text = messageTextInput.value.trim();

  if (!userName || !text) {
    return;
  }

  localStorage.setItem('username', userName);
  socket.emit('message', { userName, text, room: currentRoom });
  messageTextInput.value = '';
});

socket.on('connect', () => {
  socket.emit('joinRoom', currentRoom);
});

socket.on('roomsList', (updatedRooms) => {
  rooms = updatedRooms;

  if (!rooms.includes(currentRoom)) {
    joinRoom(DEFAULT_ROOM);

    return;
  }

  renderRooms();
});

socket.on('roomRenamed', ({ oldName, newName }) => {
  if (currentRoom === oldName) {
    currentRoom = newName;
  }
});

socket.on('roomMessages', renderMessages);
socket.on('message', renderMessage);
