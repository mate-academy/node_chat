/* eslint-env browser */
const ws = new WebSocket('ws://localhost:5000');

let username = '';
let room = '';

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);

  if (data.type === 'history') {
    document.getElementById('messages').innerHTML = data.messages
      .map(
        (msg) =>
          `<p><strong>${msg.author}</strong>: ${msg.text} (${msg.time})</p>`,
      )
      .join('');
  } else if (data.type === 'message') {
    document.getElementById('messages').innerHTML +=
      `<p><strong>${data.message.author}</strong>: ${data.message.text} (${data.message.time})</p>`;
  } else if (data.type === 'deleted') {
    alert('Room deleted!');
    location.reload();
  }
};

function joinRoom() {
  username = document.getElementById('username').value;
  room = document.getElementById('room').value;

  if (!username || !room) {
    return alert('Enter username and room name');
  }

  ws.send(JSON.stringify({ type: 'join', username, room }));
  document.getElementById('chat').style.display = 'block';
  document.getElementById('roomTitle').innerText = `Room: ${room}`;
}

function sendMessage() {
  const message = document.getElementById('messageInput').value;

  if (!message) {
    return;
  }

  ws.send(
    JSON.stringify({
      type: 'message',
      username,
      room,
      text: message,
    }),
  );
  document.getElementById('messageInput').value = '';
}

window.joinRoom = joinRoom;
window.sendMessage = sendMessage;
