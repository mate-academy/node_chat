const socket = new WebSocket(`ws://${window.location.host}`);

const usernameInput = document.getElementById('username-input');
const saveUsernameBtn = document.getElementById('save-username-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages')
const roomNameInput = document.getElementById('room-name-input');
const createRoomBtn = document.getElementById('create-room-btn');
const roomsList = document.getElementById('rooms-list');
const renameRoomInput = document.getElementById('rename-room-input');
const renameRoomBtn = document.getElementById('rename-room-btn');
const deleteRoomBtn = document.getElementById('delete-room-btn');
let currentRoomId = 'general';

function sendUsernameToServer(username) {
  if (!username) {
    return;
  }

  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify({
    type: 'set_username',
    payload: {
      username,
    },
  }));
}


socket.addEventListener('open', () => {
  console.log(`ws://${window.location.host}`)

  const savedUsername = localStorage.getItem('username');

  if (savedUsername) {
    usernameInput.value = savedUsername;
    sendUsernameToServer(savedUsername);
  }
})

socket.addEventListener('message', (event) => {
  const parsedMessage = JSON.parse(event.data);

  if (parsedMessage.type === 'new_message') {
    const { author, time, text } = parsedMessage.payload;

    const messageElement = document.createElement('p');
    messageElement.textContent = `${author} [${time}]: ${text}`;

    messagesContainer.append(messageElement);
  } else {
    console.log('Other message from server:', parsedMessage);
  }

  if (parsedMessage.type === 'rooms_list') {
    roomsList.innerHTML = '';

    parsedMessage.payload.forEach((room) => {
      const roomElement = document.createElement('p');
      roomElement.textContent = room.name;

      roomElement.addEventListener('click', () => {
        if (socket.readyState !== WebSocket.OPEN) {
          return;
        }

        currentRoomId = room.id;

        socket.send(JSON.stringify({
          type: 'join_room',
          payload: {
            roomId: room.id,
          }
        }));
      });

      roomsList.append(roomElement);
    });

    return;
  }

  if (parsedMessage.type === 'room_history') {
    messagesContainer.innerHTML = '';

    parsedMessage.payload.forEach((msg) => {
      const messageElement = document.createElement('p');
      messageElement.textContent = `${msg.author} [${msg.time}]: ${msg.text}`;

      messagesContainer.append(messageElement);
    });

    return;
  }
});

saveUsernameBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();

  if (!username) {
    return;
  }

  localStorage.setItem('username', username);

  sendUsernameToServer(username);
})

window.addEventListener('DOMContentLoaded', () => {
  const savedUsername = localStorage.getItem('username');

  if (savedUsername) {
    usernameInput.value = savedUsername;
  }

})

sendBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify({
    type: 'send_message',
    payload: {
      text,
    }
  }));

  messageInput.value = '';
})

createRoomBtn.addEventListener('click', () => {
  const roomName = roomNameInput.value.trim();

  if (!roomName) {
    return;
  }

  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify({
    type: 'create_room',
    payload: {
      name: roomName,
    }
  }));

  roomNameInput.value = '';
})

renameRoomBtn.addEventListener('click', () => {
  const newName = renameRoomInput.value.trim();

  if (!newName) {
    return;
  }

  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify({
    type: 'rename_room',
    payload: {
      roomId: currentRoomId,
      newName,
    },
  }));

  renameRoomInput.value = '';
});

deleteRoomBtn.addEventListener('click', () => {
  if (currentRoomId === 'general') {
    return;
  }

  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify({
    type: 'delete_room',
    payload: {
      roomId: currentRoomId,
    },
  }));

  currentRoomId = 'general';
});
