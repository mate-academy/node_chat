/* eslint-disable no-undef */
/* eslint-disable no-console */

const socket = io('http://localhost:3000');

const input = document.getElementById('input');
const btn = document.getElementById('send');
const messages = document.getElementById('messages');
const roomsDiv = document.getElementById('rooms');
const roomInput = document.getElementById('roomInput');
const createRoomBtn = document.getElementById('createRoom');
const renameRoomBtn = document.getElementById('renameRoom');
const deleteRoomBtn = document.getElementById('deleteRoom');

let username = localStorage.getItem('username');
let currentRoom = 'general';

function addRoom(name) {
  if ([...roomsDiv.children].some((b) => b.textContent === name)) {
    return;
  }

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

socket.on('room_renamed', ({ oldName, newName }) => {
  const btns = [...roomsDiv.children];

  btns.forEach((b) => {
    if (b.textContent === oldName) {
      b.textContent = newName;
    }
  });

  if (currentRoom === oldName) {
    currentRoom = newName;
  }

  messages.innerHTML = '';

  socket.emit('join-room', newName);
});

socket.on('room_deleted', (roomName) => {
  [...roomsDiv.children].forEach((b) => {
    if (b.textContent === roomName) {
      b.remove();
    }
  });

  if (currentRoom === roomName) {
    currentRoom = 'general';
    messages.innerHTML = '';

    socket.emit('join_room', 'general');
  }
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

renameRoomBtn.addEventListener('click', () => {
  const newName = prompt('New room name');

  if (!newName) {
    return;
  }

  socket.emit('rename_room', {
    oldName: currentRoom,
    newName,
  });
});

deleteRoomBtn.addEventListener('click', () => {
  socket.emit('delete_room', currentRoom);
});
