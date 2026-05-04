/* eslint-disable no-undef */
/* eslint-disable no-console */

const socket = io('http://localhost:3000');

const input = document.getElementById('input');
const btn = document.getElementById('send');
const messages = document.getElementById('messages');
const roomsDiv = document.getElementById('rooms');
const roomInput = document.getElementById('roomInput');
const createRoomBtn = document.getElementById('createRoom');

let username = localStorage.getItem('username');
let currentRoom = 'general';

function addRoom(name) {
  const button = document.createElement('button');

  button.textContent = name;

  button.addEventListener('click', () => {
    socket.emit('join_room', name);
    currentRoom = name;

    messages.innerHTML = '';
  });

  roomsDiv.appendChild(button);
}

if (!username) {
  username = prompt('Enter username');
  localStorage.setItem('username', username);
}

socket.emit('set_username', username);

socket.on('connect', () => {
  console.log('Connected:', socket.id);

  socket.emit('join_room', 'general');
  currentRoom = 'general';

  messages.innerHTML = '';

  addRoom('general');
});

socket.on('message', (data) => {
  const div = document.createElement('div');

  const time = new Date(data.time).toLocaleString();

  div.textContent = `${data.author} [${time}]: ${data.text}`;
  messages.appendChild(div);
});

socket.on('room_history', (mgss) => {
  mgss.forEach((msg) => {
    const div = document.createElement('div');

    const time = new Date(msg.time).toLocaleTimeString();

    div.textContent = `${msg.author} [${time}]: ${msg.text}`;

    messages.appendChild(div);
  });
});

socket.on('room_created', (roomName) => {
  addRoom(roomName);
});

btn.addEventListener('click', () => {
  const text = input.value;

  if (!text) {
    return;
  }

  socket.emit('message', {
    text,
    author: username,
    time: Date.now(),
    room: currentRoom,
  });

  input.value = '';
});

createRoomBtn.addEventListener('click', () => {
  const roomName = roomInput.value.trim();

  if (!roomName) {
    return;
  }

  socket.emit('create_room', roomName);
  socket.emit('join_room', roomName);

  currentRoom = roomName;

  messages.innerHTML = '';
  roomInput.value = '';
});
