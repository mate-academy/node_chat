/* global WebSocket */
const loginForm = document.getElementById('loginForm');
const messageForm = document.getElementById('messageForm');
// const roomForm = document.getElementById('roomForm');
const dashboard = document.querySelector('.dashboard');

const usernameInput = loginForm.querySelector('input');
const messageInput = messageForm.querySelector('input');
// const roomInput = roomForm.querySelector('input');

const messageList = document.querySelector('.dashboard__messages--list');
const roomList = document.querySelector('.dashboard__rooms--list');

const sessionUsername = window.localStorage.getItem('username');

let ws = null;

function initWebSocket() {
  if (ws) {
    ws.removeEventListener('message', handleMessage);
    ws.close();
    ws = null; // Clear the reference
  }

  ws = new WebSocket('ws://localhost:3005');

  // ws.onopen = () => {
  //   console.log('WebSocket connected');
  // };

  ws.addEventListener('message', handleMessage);

  // ws.onclose = () => {
  //   console.log('WebSocket disconnected');
  // };

  // ws.onerror = (error) => {
  //   console.error('WebSocket error:', error);
  // };
}

if (sessionUsername) {
  dashboard.style.display = 'flex';
  loginForm.style.display = 'none';

  messageList.innerHTML = '';
  roomList.innerHTML = '';
  initWebSocket();
} else {
  dashboard.style.display = 'none';
  loginForm.style.display = 'flex';
}

function createUsername(e) {
  e.preventDefault();

  const username = usernameInput.value.trim();

  if (username) {
    window.localStorage.setItem('username', username);

    loginForm.style.display = 'none';
    dashboard.style.display = 'flex';

    messageList.innerHTML = '';
    roomList.innerHTML = '';
    initWebSocket();
  }
}

let isSending = false;

function handleMessage(event) {
  const data = event.data;
  const message = JSON.parse(data);

  if (message.username && message.text) {
    addMessageToUI(message);
  }
}

function sendMessage(e) {
  e.preventDefault();

  if (isSending) {
    return;
  }

  const text = messageInput.value.trim();
  const username = window.localStorage.getItem('username');

  if (text && username) {
    isSending = true;

    fetch('http://localhost:3005/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, text }),
    })
      .then(() => {
        messageInput.value = '';
      })
      .catch(() => {
        const errMessage = document.createElement('div');

        errMessage.classList.add('notification', 'is-danger');
        errMessage.innerHTML = '<b>Failed to add message</b>';
        messageForm.after(errMessage);
      })
      .finally(() => (isSending = false));
  }
}

function addMessageToUI(message) {
  const li = document.createElement('li');

  const usernameP = document.createElement('p');

  usernameP.className = 'has-text-weight-bold';
  usernameP.textContent = message.username;

  const textP = document.createElement('p');

  textP.textContent = message.text;

  const timeP = document.createElement('p');

  timeP.className = 'is-size-7';
  timeP.textContent = new Date(message.time).toLocaleString();

  li.appendChild(usernameP);
  li.appendChild(textP);
  li.appendChild(timeP);

  messageList.appendChild(li);
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  createUsername(e);
});

messageForm.addEventListener(
  'submit',
  (e) => {
    e.preventDefault();
    sendMessage(e);
  },
  { passive: false },
);

window.addEventListener('beforeunload', () => {
  if (ws) {
    ws.close();
  }
});
