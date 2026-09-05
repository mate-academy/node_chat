/* eslint-env browser */
/* eslint-disable padding-line-between-statements, curly, max-len, no-shadow */
'use strict';

const $ = (s) => document.querySelector(s);
const state = {
  username: localStorage.getItem('chat.username') || '',
  roomId: localStorage.getItem('chat.roomId') || '',
  rooms: [],
};
const escape = (value) => {
  const node = document.createElement('span');
  node.textContent = value;
  return node.innerHTML;
};
async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}
function notice(text) {
  $('#toast').textContent = text;
  $('#toast').classList.add('show');
  setTimeout(() => $('#toast').classList.remove('show'), 2200);
}
function setName(name) {
  state.username = name;
  localStorage.setItem('chat.username', name);
  $('#username').textContent = name;
  $('#avatar').textContent = name[0].toUpperCase();
}
function drawRooms() {
  $('#rooms').innerHTML = state.rooms
    .map(
      (room) =>
        `<button data-id="${room.id}" class="room ${room.id === state.roomId ? 'active' : ''}"><b>#</b><span>${escape(room.name)}</span><small>${room.messageCount}</small></button>`,
    )
    .join('');
}
function messageView(message) {
  return `<article data-message="${message.id}" class="${message.author === state.username ? 'mine' : ''}"><i>${escape(message.author[0].toUpperCase())}</i><div><div class="meta"><strong>${escape(message.author)}</strong><time>${new Date(message.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</time></div><p>${escape(message.text)}</p></div></article>`;
}
function drawMessages(messages) {
  $('#messages').innerHTML = messages.length
    ? messages.map(messageView).join('')
    : '<div class="empty">No messages yet.<small>Say hello and start the conversation.</small></div>';
  $('#messages').scrollTop = $('#messages').scrollHeight;
}
async function join(id) {
  try {
    const room = await api(`/api/rooms/${id}/join`, {
      method: 'POST',
      body: '{}',
    });
    state.roomId = id;
    localStorage.setItem('chat.roomId', id);
    $('#title').textContent = `# ${room.name}`;
    $('#info').textContent =
      `${room.messages.length} messages · History is saved`;
    drawRooms();
    drawMessages(room.messages);
  } catch (e) {
    notice(e.message);
  }
}
async function refresh(data) {
  state.rooms = data.rooms;
  if (!state.rooms.some((r) => r.id === state.roomId))
    state.roomId = state.rooms[0]?.id || '';
  drawRooms();
  if (state.roomId) await join(state.roomId);
}
$('#rooms').onclick = (event) => {
  const button = event.target.closest('[data-id]');
  if (button) join(button.dataset.id);
};
$('#login-form').onsubmit = async (event) => {
  event.preventDefault();
  const name = $('#name').value.trim();
  if (!name) return;
  try {
    const user = await api('/api/users', {
      method: 'POST',
      body: JSON.stringify({ username: name }),
    });
    setName(user.username);
    $('#login').close();
  } catch (e) {
    notice(e.message);
  }
};
$('#change').onclick = () => {
  $('#name').value = state.username;
  $('#login').showModal();
};
$('#composer').onsubmit = async (event) => {
  event.preventDefault();
  const input = $('#text');
  const text = input.value.trim();
  if (!state.username) return $('#login').showModal();
  if (!text || !state.roomId) return;
  input.value = '';
  try {
    await api(`/api/rooms/${state.roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ author: state.username, text }),
    });
  } catch (e) {
    input.value = text;
    notice(e.message);
  }
};
$('#text').onkeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    $('#composer').requestSubmit();
  }
};
$('#create').onclick = async () => {
  const name = prompt('New room name:')?.trim();
  if (!name) return;
  try {
    const room = await api('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    join(room.id);
  } catch (e) {
    notice(e.message);
  }
};
$('#rename').onclick = async () => {
  const room = state.rooms.find((r) => r.id === state.roomId);
  if (!room) return;
  const name = prompt('Rename room:', room.name)?.trim();
  if (name && name !== room.name)
    try {
      await api(`/api/rooms/${room.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
    } catch (e) {
      notice(e.message);
    }
};
$('#remove').onclick = async () => {
  const room = state.rooms.find((r) => r.id === state.roomId);
  if (room && confirm(`Delete #${room.name} and its messages?`))
    try {
      await api(`/api/rooms/${room.id}`, { method: 'DELETE' });
    } catch (e) {
      notice(e.message);
    }
};
const events = new EventSource('/events');
events.addEventListener('rooms', (e) => refresh(JSON.parse(e.data)));
events.addEventListener('room-deleted', (e) => refresh(JSON.parse(e.data)));
events.addEventListener('message', (e) => {
  const { roomId, message } = JSON.parse(e.data);
  const room = state.rooms.find((r) => r.id === roomId);
  if (room) {
    room.messageCount++;
    drawRooms();
  }
  if (
    roomId === state.roomId &&
    !document.querySelector(`[data-message="${message.id}"]`)
  ) {
    $('#messages .empty')?.remove();
    $('#messages').insertAdjacentHTML('beforeend', messageView(message));
    $('#messages').scrollTop = $('#messages').scrollHeight;
    $('#info').textContent = `${room.messageCount} messages · History is saved`;
  }
});
events.onerror = () => notice('Reconnecting…');
if (state.username) setName(state.username);
else $('#login').showModal();
api('/api/rooms')
  .then(refresh)
  .catch((e) => notice(e.message));
