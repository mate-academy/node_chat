/* eslint-disable no-shadow */
/* eslint-env browser */
/* global io */

const api = {
  async listRooms() {
    const res = await fetch('/api/rooms');

    return res.json();
  },
  // eslint-disable-next-line no-shadow
  async createRoom(name) {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const e = await res.json();

      throw new Error(e.message || 'Failed to create room');
    }

    return res.json();
  },
  async renameRoom(id, name) {
    const res = await fetch(`/api/rooms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const e = await res.json();

      throw new Error(e.message || 'Failed to rename room');
    }

    return res.json();
  },
  async deleteRoom(id) {
    const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      const e = await res.json();

      throw new Error(e.message || 'Failed to delete room');
    }
  },
  async getHistory(id) {
    const res = await fetch(`/api/rooms/${id}/messages`);

    if (!res.ok) {
      const e = await res.json();

      throw new Error(e.message || 'Failed to fetch history');
    }

    return res.json();
  },
};

const $ = (sel) => document.querySelector(sel);
// eslint-disable-next-line no-unused-vars
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = {
  username: localStorage.getItem('username') || '',
  rooms: [],
  currentRoomId: null,
};

const socket = io();

function saveUsername(name) {
  state.username = name.trim();
  localStorage.setItem('username', state.username);
  socket.emit('auth', { username: state.username });
}

function renderRooms() {
  const list = $('#roomsList');

  list.innerHTML = '';

  state.rooms.forEach((r) => {
    const li = document.createElement('li');

    li.textContent = r.name;
    li.dataset.id = r.id;

    if (r.id === state.currentRoomId) {
      li.classList.add('active');
    }
    li.addEventListener('click', () => joinRoom(r.id));
    list.appendChild(li);
  });
}

function fmtTime(iso) {
  try {
    const d = new Date(iso);

    return d.toLocaleString();
  } catch (_) {
    return iso;
  }
}

function appendMessage(m) {
  const box = $('#messages');
  const div = document.createElement('div');

  div.className = 'message';

  div.innerHTML = `
    <div class="meta"><strong>${m.author}</strong> • ${fmtTime(m.at)}</div>
    <div class="text"></div>
  `;
  div.querySelector('.text').textContent = m.text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function joinRoom(roomId) {
  state.currentRoomId = roomId;

  const room = state.rooms.find((r) => r.id === roomId);

  $('#roomTitle').textContent = room ? room.name : 'Room';
  $('#renameRoomBtn').disabled = !room;
  $('#deleteRoomBtn').disabled = !room;
  $('#messages').innerHTML = '';

  const history = await api.getHistory(roomId);

  history.forEach(appendMessage);
  socket.emit('joinRoom', { roomId });
  renderRooms();
}

async function init() {
  const profileForm = $('#profileForm');
  const usernameInput = $('#username');

  usernameInput.value = state.username;

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = usernameInput.value.trim();

    if (name) {
      saveUsername(name);
    }
  });

  if (state.username) {
    socket.emit('auth', { username: state.username });
  }

  $('#createRoomBtn').addEventListener('click', async () => {
    const name = prompt('Room name');

    if (!name) {
      return;
    }
    await api.createRoom(name);
  });

  $('#renameRoomBtn').addEventListener('click', async () => {
    if (!state.currentRoomId) {
      return;
    }

    const current = state.rooms.find((r) => r.id === state.currentRoomId);
    const name = prompt('New room name', current?.name || '');

    if (!name) {
      return;
    }
    await api.renameRoom(state.currentRoomId, name);
  });

  $('#deleteRoomBtn').addEventListener('click', async () => {
    if (!state.currentRoomId) {
      return;
    }

    if (!confirm('Delete this room?')) {
      return;
    }
    await api.deleteRoom(state.currentRoomId);
    state.currentRoomId = null;
    $('#roomTitle').textContent = 'Select a room';
    $('#messages').innerHTML = '';
  });

  const form = $('#messageForm');
  const input = $('#messageInput');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = input.value.trim();

    if (!text || !state.currentRoomId) {
      return;
    }

    socket.emit('message:send', {
      roomId: state.currentRoomId,
      text,
    });
    input.value = '';
  });

  state.rooms = await api.listRooms();
  renderRooms();

  if (state.rooms.length && !state.currentRoomId) {
    await joinRoom(state.rooms[0].id);
  }
}

socket.on('rooms:update', (rooms) => {
  state.rooms = rooms;
  renderRooms();

  if (state.currentRoomId && !rooms.some((r) => r.id === state.currentRoomId)) {
    state.currentRoomId = null;
    $('#roomTitle').textContent = 'Select a room';
    $('#messages').innerHTML = '';
  }
});

socket.on('room:joined', ({ roomId }) => {
  if (roomId !== state.currentRoomId) {
    state.currentRoomId = roomId;
  }
});

socket.on('message:new', ({ roomId, message }) => {
  if (roomId === state.currentRoomId) {
    appendMessage(message);
  }
});

socket.on('message:history', ({ roomId, messages }) => {
  if (roomId === state.currentRoomId) {
    $('#messages').innerHTML = '';
    messages.forEach(appendMessage);
  }
});

window.addEventListener('DOMContentLoaded', init);
