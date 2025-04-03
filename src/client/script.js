/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const socket = io();
let username = localStorage.getItem('username') || '';
let currentRoom = '';

function setUsername() {
  username = document.getElementById('username').value.trim();

  if (username.length < 3) {
    alert('Name must be at least 3 characters');

    return;
  }

  localStorage.setItem('username', username);
}

function createRoom() {
  const roomName = document.getElementById('room-name').value.trim();

  if (!roomName) {
    return alert('Enter a room name!');
  }

  socket.emit('createRoom', roomName);
}

function joinRoom(roomName) {
  currentRoom = roomName;
  document.getElementById('chat-box').style.display = 'block';
  document.getElementById('current-room').innerText = `Room: ${roomName}`;
  socket.emit('joinRoom', { username, roomName });
}

function sendMessage() {
  const messageInput = document.getElementById('message');
  const message = messageInput.value.trim();

  if (message && username && currentRoom) {
    socket.emit('chatMessage', { username, roomName: currentRoom, message });
    messageInput.value = '';
  }
}

socket.on('roomList', (rooms) => {
  const roomsDiv = document.getElementById('rooms');

  roomsDiv.innerHTML = '<h3>Available Rooms:</h3>';

  rooms.forEach((room) => {
    const roomElement = document.createElement('button');

    roomElement.innerText = room;
    roomElement.onclick = () => joinRoom(room);
    roomsDiv.appendChild(roomElement);
  });
});

socket.on('message', (data) => {
  const messagesDiv = document.getElementById('messages');
  const messageElement = document.createElement('div');

  messageElement.textContent = `[${data.time}] ${data.username}: ${data.message}`;
  messagesDiv.appendChild(messageElement);
});

socket.emit('getRooms');
