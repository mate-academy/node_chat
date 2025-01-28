const apiBaseUrl = 'http://localhost:3005';
let currentUser = localStorage.getItem('username') || '';
let currentRoom = '';

document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');
  const saveUsernameButton = document.getElementById('save-username');
  const roomNameInput = document.getElementById('room-name');
  const createRoomButton = document.getElementById('create-room');
  const joinRoomButton = document.getElementById('join-room');
  const messageInput = document.getElementById('message');
  const sendMessageButton = document.getElementById('send-message');
  const messagesDiv = document.getElementById('messages');

  if (currentUser) {
    usernameInput.value = currentUser;
  }

  saveUsernameButton.addEventListener('click', () => {
    currentUser = usernameInput.value;

    if (!currentUser) {
      return alert("Введіть ім'я!");
    }
    localStorage.setItem('username', currentUser);
    alert("Ім'я збережено");
  });

  createRoomButton.addEventListener('click', async () => {
    const roomName = roomNameInput.value;

    if (!roomName) {
      return alert('Введіть назву кімнати!');
    }

    try {
      const res = await fetch(`${apiBaseUrl}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName }),
      });

      if (res.ok) {
        currentRoom = roomName;
        alert('Кімната створена');
      } else {
        const error = await res.text();

        alert(error);
      }
    } catch (err) {
      console.error(err);
    }
  });

  joinRoomButton.addEventListener('click', async () => {
    const roomName = roomNameInput.value;

    if (!roomName) {
      return alert('Введіть назву кімнати!');
    }

    try {
      const res = await fetch(`${apiBaseUrl}/rooms/${roomName}`);

      if (res.ok) {
        currentRoom = roomName;

        const messages = await res.json();

        messagesDiv.innerHTML = messages
          .map(
            (msg) =>
              `<div class="message"><strong>${msg.author}</strong> [${new Date(msg.time).toLocaleTimeString()}]: ${msg.text}</div>`,
          )
          .join('');
        alert('Ви приєдналися до кімнати');
      } else {
        const error = await res.text();

        alert(error);
      }
    } catch (err) {
      console.error(err);
    }
  });

  sendMessageButton.addEventListener('click', async () => {
    const message = messageInput.value;

    if (!currentRoom) {
      return alert('Спочатку приєднайтесь до кімнати!');
    }

    if (!message) {
      return alert('Введіть повідомлення!');
    }

    try {
      const res = await fetch(`${apiBaseUrl}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: currentRoom,
          author: currentUser,
          text: message,
        }),
      });

      if (res.ok) {
        const msg = {
          author: currentUser,
          text: message,
          time: new Date().toISOString(),
        };

        messagesDiv.innerHTML += `<div class="message"><strong>${msg.author}</strong> [${new Date(msg.time).toLocaleTimeString()}]: ${msg.text}</div>`;
        messageInput.value = '';
      } else {
        const error = await res.text();

        alert(error);
      }
    } catch (err) {
      console.error(err);
    }
  });
});
