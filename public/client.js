'use strict';

const socket = io();
let username = '';
let currentRoom = '';

// ============================
// Ініціалізація та Логін
// ============================
window.onload = () => {
  const savedUser = localStorage.getItem('chat_username');
  if (savedUser) {
    username = savedUser;
    showChatScreen();
  }
};

function saveUsername() {
  const input = document.getElementById('username-input').value.trim();
  if (input) {
    username = input;
    localStorage.setItem('chat_username', username);
    showChatScreen();
  }
}

function logout() {
  localStorage.removeItem('chat_username');
  window.location.reload();
}

function showChatScreen() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('chat-screen').style.display = 'flex';
}

// ============================
// Управління кімнатами
// ============================
socket.on('rooms_list', (rooms) => {
  const listDiv = document.getElementById('rooms-list');
  listDiv.innerHTML = '';
  
  rooms.forEach(room => {
    const el = document.createElement('div');
    el.className = 'room-item';
    el.innerHTML = `
      <span onclick="joinRoom('${room}')">${room}</span>
      <div class="room-actions">
        <button onclick="renameRoom('${room}')">✎</button>
        <button onclick="deleteRoom('${room}')">❌</button>
      </div>
    `;
    listDiv.appendChild(el);
  });
});

function createRoom() {
  const roomName = prompt('Enter new room name:');
  if (roomName && roomName.trim()) {
    socket.emit('create_room', roomName.trim());
  }
}

function renameRoom(oldName) {
  const newName = prompt(`Rename room "${oldName}" to:`);
  if (newName && newName.trim()) {
    socket.emit('rename_room', { oldName, newName: newName.trim() });
  }
}

function deleteRoom(roomName) {
  if (confirm(`Are you sure you want to delete "${roomName}"?`)) {
    socket.emit('delete_room', roomName);
  }
}

function joinRoom(roomName) {
  currentRoom = roomName;
  document.getElementById('current-room-title').innerText = roomName;
  document.getElementById('msg-input').disabled = false;
  document.getElementById('send-btn').disabled = false;
  socket.emit('join_room', roomName);
}

// Якщо хтось перейменував кімнату, в якій ми зараз знаходимось
socket.on('room_renamed', ({ oldName, newName }) => {
  if (currentRoom === oldName) {
    joinRoom(newName);
  }
});

// Якщо хтось видалив кімнату, в якій ми зараз знаходимось
socket.on('room_deleted', (roomName) => {
  if (currentRoom === roomName) {
    currentRoom = '';
    document.getElementById('current-room-title').innerText = 'Select a room';
    document.getElementById('messages').innerHTML = '';
    document.getElementById('msg-input').disabled = true;
    document.getElementById('send-btn').disabled = true;
  }
});

// ============================
// Управління повідомленнями
// ============================
socket.on('room_history', (messages) => {
  const msgContainer = document.getElementById('messages');
  msgContainer.innerHTML = '';
  messages.forEach(appendMessage);
  scrollToBottom();
});

socket.on('new_message', (msg) => {
  appendMessage(msg);
  scrollToBottom();
});

function sendMessage() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  
  if (text && currentRoom) {
    socket.emit('send_message', {
      room: currentRoom,
      author: username,
      text: text
    });
    input.value = '';
  }
}

// Відправка повідомлення по натисканню Enter
document.getElementById('msg-input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function appendMessage(msg) {
  const msgContainer = document.getElementById('messages');
  const msgEl = document.createElement('div');
  msgEl.className = 'msg';
  msgEl.innerHTML = `
    <div class="msg-header"><b>${msg.author}</b> • ${msg.time}</div>
    <div class="msg-text">${msg.text}</div>
  `;
  msgContainer.appendChild(msgEl);
}

function scrollToBottom() {
  const msgContainer = document.getElementById('messages');
  msgContainer.scrollTop = msgContainer.scrollHeight;
}