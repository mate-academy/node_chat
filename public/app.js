const socket = io('ws://localhost:3500');

const msgInput = document.querySelector('#message');
const nameInput = document.querySelector('#name');
const chatRoom = document.querySelector('#room');
const roomList = document.querySelector('.room-list');
const chatDisplay = document.querySelector('.chat-display');
const renameRoomBtn = document.querySelector('#rename-room');
const deleteRoomBtn = document.querySelector('#delete-room');

document.addEventListener('DOMContentLoaded', () => {
  const storedName = localStorage.getItem('chatUsername');
  if (storedName) {
    nameInput.value = storedName;
  }

  document.querySelector('.form-msg').addEventListener('submit', sendMessage);
  document.querySelector('.form-join').addEventListener('submit', enterRoom);

  if (renameRoomBtn) renameRoomBtn.addEventListener('click', renameRoom);
  if (deleteRoomBtn) deleteRoomBtn.addEventListener('click', deleteRoom);
});

nameInput.addEventListener('input', () => {
  localStorage.setItem('chatUsername', nameInput.value);
});

function sendMessage(e) {
  e.preventDefault();
  if (nameInput.value && msgInput.value && chatRoom.value) {
    socket.emit('message', {
      name: nameInput.value,
      text: msgInput.value,
    });
    msgInput.value = '';
  }
  msgInput.focus();
}

function enterRoom(e) {
  e.preventDefault();
  if (nameInput.value && chatRoom.value) {
    socket.emit('enterRoom', {
      name: nameInput.value,
      room: chatRoom.value,
    });
  }
}

function renameRoom() {
  const newRoomName = prompt('Enter a new room name:');
  if (newRoomName) {
    socket.emit('renameRoom', {
      oldRoom: chatRoom.value,
      newRoom: newRoomName,
    });
    chatRoom.value = newRoomName;
  }
}

function deleteRoom() {
  if (confirm(`Are you sure you want to delete room "${chatRoom.value}"?`)) {
    socket.emit('deleteRoom', { room: chatRoom.value });
  }
}

socket.on('message', (data) => {
  const { name, text, time } = data;
  const li = document.createElement('li');
  li.className = 'post';
  if (name === nameInput.value) li.classList.add('post--left');
  else if (name !== 'Admin') li.classList.add('post--right');

  li.innerHTML = `
        <div class="post__header">
            <span class="post__header--name">${name}</span>
            <span class="post__header--time">${formatTime(time)}</span>
        </div>
        <div class="post__text">${text}</div>
    `;

  chatDisplay.appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

socket.on('roomList', ({ rooms }) => {
  showRooms(rooms);
});

function showRooms(rooms) {
  roomList.innerHTML = '<strong>Active Rooms:</strong>';
  rooms.forEach((room) => {
    const li = document.createElement('li');
    li.textContent = room;
    roomList.appendChild(li);
  });
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}
