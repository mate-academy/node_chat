/* eslint-env browser */
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'getRooms' }));
};

let username = localStorage.getItem('username') || '';

const usernameInput = document.getElementById('username-input');
const usernameSubmit = document.getElementById('username-submit');
const roomsList = document.getElementById('rooms-list');
const newRoomInput = document.getElementById('new-room-input');
const createRoomBtn = document.getElementById('create-room-btn');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');

usernameInput.value = username;

usernameSubmit.addEventListener('click', () => {
  username = usernameInput.value;
  localStorage.setItem('username', username);
});

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);

  if (data.type === 'rooms') {
    roomsList.innerHTML = '';

    data.rooms.forEach((room) => {
      const li = document.createElement('li');

      const nameSpan = document.createElement('span');
      nameSpan.textContent = room.name;
      nameSpan.addEventListener('click', () => {
        ws.send(JSON.stringify({ type: 'join', roomId: room.id, username }));
      });

      const renameBtn = document.createElement('button');
      renameBtn.textContent = 'Rename';
      renameBtn.addEventListener('click', () => {
        const newName = prompt('New room name:', room.name);
        if (newName) {
          ws.send(
            JSON.stringify({ type: 'renameRoom', roomId: room.id, newName }),
          );
        }
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        ws.send(JSON.stringify({ type: 'deleteRoom', roomId: room.id }));
      });

      li.appendChild(nameSpan);
      li.appendChild(renameBtn);
      li.appendChild(deleteBtn);
      roomsList.appendChild(li);
    });
  }

  if (data.type === 'roomHistory') {
    messagesDiv.innerHTML = '';

    data.messages.forEach((message) => {
      const p = document.createElement('p');
      p.textContent = `[${message.time}] ${message.author}: ${message.text}`;
      messagesDiv.appendChild(p);
    });
  }

  if (data.type === 'newMessage') {
    const p = document.createElement('p');
    p.textContent = `[${data.message.time}] ${data.message.author}: ${data.message.text}`;
    messagesDiv.appendChild(p);
  }
};

createRoomBtn.addEventListener('click', () => {
  ws.send(JSON.stringify({ type: 'createRoom', name: newRoomInput.value }));
  newRoomInput.value = '';
});

sendMessageBtn.addEventListener('click', () => {
  ws.send(JSON.stringify({ type: 'message', text: messageInput.value }));
  messageInput.value = '';
});
