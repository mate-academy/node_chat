/* eslint-disable no-console */
/* eslint-disable no-undef */
const ws = new WebSocket('ws://localhost:8080');
/* eslint-enable no-undef */
let currentRoom = null;
let currentRoomName = '';

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'roomCreated':
      console.log(`Room created with ID: ${data.roomId}`);
      break;

    case 'roomJoined':
      currentRoom = data.roomId;
      currentRoomName = data.roomName || document.getElementById('room').value;

      document.getElementById('chat').innerHTML =
        `<h2>Messages in <span id="roomName">${currentRoomName}</span> chat:</h2>`;
      data.messages.forEach((msg) => addMessage(msg));
      enableChat();
      document.getElementById('roomControls').style.display = 'block';
      break;

    case 'newMessage':
      addMessage(data.message);
      break;

    case 'roomRenamed':
      currentRoomName = data.newName;
      document.getElementById('roomName').textContent = currentRoomName;
      console.log(`Room renamed to: ${data.newName}`);
      break;

    case 'roomDeleted':
      if (currentRoom === data.roomId) {
        console.log('Room deleted, please join another room');
        currentRoom = null;
        currentRoomName = '';
        document.getElementById('chat').innerHTML = '';
        disableChat();
        document.getElementById('roomControls').style.display = 'none';
      }
      break;
  }
};

function setUsername() {
  const userName = document.getElementById('username').value;

  if (!userName) {
    console.log('Please enter a username.');

    return;
  }
  /* eslint-disable no-undef */
  localStorage.setItem('username', userName);
  /* eslint-enable no-undef */

  ws.send(JSON.stringify({ type: 'setUsername', userName }));
}

function createRoom() {
  const roomName = document.getElementById('room').value;

  if (!roomName) {
    console.log('Please enter a room name.');

    return;
  }
  ws.send(JSON.stringify({ type: 'createRoom', roomName }));
}

function joinRoom() {
  const roomId = document.getElementById('roomId').value;

  if (!roomId) {
    console.log('Please enter a valid room ID.');

    return;
  }
  ws.send(JSON.stringify({ type: 'joinRoom', roomId }));
}

function sendMessage() {
  const text = document.getElementById('message').value;

  if (!text) {
    console.log('Message cannot be empty');

    return;
  }
  ws.send(JSON.stringify({ type: 'sendMessage', text }));
  document.getElementById('message').value = '';
}

function addMessage(message) {
  if (!message.color || !message.author || !message.time || !message.text) {
    console.error('Message object is missing required properties:', message);

    return;
  }

  const chat = document.getElementById('chat');

  if (!chat) {
    console.error('Chat element not found.');

    return;
  }

  const msgElem = document.createElement('div');

  msgElem.classList.add('message');

  msgElem.innerHTML = `
    <strong style="color: ${message.color}">${message.author}</strong>:
    <span>[${new Date(message.time).toLocaleTimeString()}]</span>
    <p>${message.text}</p>
  `;

  chat.appendChild(msgElem);
}

function enableChat() {
  document.getElementById('message').disabled = false;
  document.getElementById('sendMessageButton').disabled = false;
}

function disableChat() {
  document.getElementById('message').disabled = true;
  document.getElementById('sendMessageButton').disabled = true;
}

function renameRoom() {
  const newName = document.getElementById('newRoomName').value;

  if (!newName) {
    console.log('Please enter a new room name.');

    return;
  }
  ws.send(JSON.stringify({ type: 'renameRoom', roomId: currentRoom, newName }));
}

function deleteRoom() {
  /* eslint-disable no-undef */
  if (confirm('Are you sure you want to delete this room?')) {
    /* eslint-enable no-undef */
    ws.send(JSON.stringify({ type: 'deleteRoom', roomId: currentRoom }));
    document.getElementById('roomControls').style.display = 'none';
  }
}

document
  .getElementById('setUsernameButton')
  .addEventListener('click', setUsername);

document
  .getElementById('createRoomButton')
  .addEventListener('click', createRoom);

document.getElementById('joinRoomButton').addEventListener('click', joinRoom);

document
  .getElementById('sendMessageButton')
  .addEventListener('click', sendMessage);

document
  .getElementById('renameRoomButton')
  .addEventListener('click', renameRoom);

document
  .getElementById('deleteRoomButton')
  .addEventListener('click', deleteRoom);
