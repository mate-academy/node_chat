/* eslint-disable no-undef */
/* eslint-disable no-console */
// public/main.js
(function () {
  const serverHostEl = document.getElementById('serverHost');

  serverHostEl.textContent = location.host;

  const usernameInput = document.getElementById('usernameInput');
  const setUsernameBtn = document.getElementById('setUsernameBtn');

  const roomsListEl = document.getElementById('roomsList');
  const createRoomBtn = document.getElementById('createRoomBtn');

  const currentRoomNameEl = document.getElementById('currentRoomName');
  const messagesEl = document.getElementById('messages');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');

  const WS_URL =
    (location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + location.host;
  const ws = new WebSocket(WS_URL);

  const state = {
    username: localStorage.getItem('chat_username') || '',
    rooms: [],
    currentRoomId: localStorage.getItem('chat_current_room') || null,
  };

  usernameInput.value = state.username;

  function wsSend(type, payload) {
    const msg = { type, payload };

    ws.send(JSON.stringify(msg));
  }

  function renderRooms() {
    roomsListEl.innerHTML = '';

    state.rooms.forEach((r) => {
      const li = document.createElement('li');
      const name = document.createElement('span');

      name.textContent = r.name;
      name.style.cursor = 'pointer';
      name.onclick = () => joinRoom(r.id);

      const controls = document.createElement('span');

      controls.className = 'controls';

      const joinBtn = document.createElement('button');

      joinBtn.textContent = 'Join';
      joinBtn.onclick = () => joinRoom(r.id);

      const renameBtn = document.createElement('button');

      renameBtn.textContent = 'Rename';

      renameBtn.onclick = () => {
        const newName = prompt('New room name', r.name);

        if (newName && newName.trim()) {
          wsSend('rename_room', { roomId: r.id, name: newName.trim() });
        }
      };

      const delBtn = document.createElement('button');

      delBtn.textContent = 'Del';

      delBtn.onclick = () => {
        if (confirm(`Delete room "${r.name}"?`)) {
          wsSend('delete_room', { roomId: r.id });
        }
      };

      controls.appendChild(joinBtn);
      controls.appendChild(renameBtn);
      controls.appendChild(delBtn);

      li.appendChild(name);
      li.appendChild(controls);

      if (state.currentRoomId === r.id) {
        li.style.background = '#eef';
      }
      roomsListEl.appendChild(li);
    });
  }

  function renderMessages(messages) {
    messagesEl.innerHTML = '';

    messages.forEach((m) => {
      const div = document.createElement('div');

      div.className = 'message';

      const meta = document.createElement('div');

      meta.className = 'meta';

      const time = new Date(m.ts).toLocaleString();

      meta.textContent = `${m.author} • ${time}`;

      const text = document.createElement('div');

      text.className = 'text';
      text.textContent = m.text;
      div.appendChild(meta);
      div.appendChild(text);
      messagesEl.appendChild(div);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function joinRoom(roomId) {
    if (!roomId) {
      return;
    }
    wsSend('join_room', { roomId });
    // we'll set currentRoomId when we receive joined_room from server
  }

  setUsernameBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();

    if (!username) {
      return alert('Enter username');
    }
    state.username = username;
    localStorage.setItem('chat_username', username);
    wsSend('set_username', { username });
  });

  createRoomBtn.addEventListener('click', () => {
    const name = prompt('Room name');

    if (name && name.trim()) {
      wsSend('create_room', { name: name.trim() });
    }
  });

  sendBtn.addEventListener('click', () => {
    const txt = messageInput.value.trim();

    if (!txt) {
      return;
    }

    const rid = state.currentRoomId;

    if (!rid) {
      return alert('Join a room first');
    }
    wsSend('send_message', { roomId: rid, text: txt });
    messageInput.value = '';
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendBtn.click();
    }
  });

  ws.addEventListener('open', () => {
    // set username on connect if known
    if (state.username) {
      wsSend('set_username', { username: state.username });
    }
  });

  ws.addEventListener('message', (ev) => {
    let msg;

    try {
      msg = JSON.parse(ev.data);
    } catch (e) {
      console.error('Invalid JSON from server', ev.data);

      return;
    }

    if (!msg || !msg.type) {
      return;
    }

    const p = msg.payload || {};

    switch (msg.type) {
      case 'rooms_list': {
        state.rooms = Array.isArray(p.rooms) ? p.rooms : [];
        renderRooms();

        // Auto-join preferred room
        if (!state.currentRoomId) {
          // try remembered room
          const remembered = localStorage.getItem('chat_current_room');

          if (remembered && state.rooms.some((r) => r.id === remembered)) {
            joinRoom(remembered);
          } else if (state.rooms.length > 0) {
            // join first room by default
            joinRoom(state.rooms[0].id);
          }
        }
        break;
      }

      case 'joined_room': {
        state.currentRoomId = p.roomId;
        localStorage.setItem('chat_current_room', p.roomId);
        currentRoomNameEl.textContent = p.roomName || '—';
        renderMessages(Array.isArray(p.messages) ? p.messages : []);
        renderRooms();
        break;
      }

      case 'message': {
        const { roomId, message } = p;
        // if message belongs to current room, append

        if (roomId === state.currentRoomId) {
          // const msgs = Array.from(messagesEl.children);
          // simply re-render by appending one element
          const div = document.createElement('div');

          div.className = 'message';

          const meta = document.createElement('div');

          meta.className = 'meta';
          meta.textContent = `${message.author} • ${new Date(message.ts).toLocaleString()}`;

          const text = document.createElement('div');

          text.className = 'text';
          text.textContent = message.text;
          div.appendChild(meta);
          div.appendChild(text);
          messagesEl.appendChild(div);
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }
        break;
      }

      case 'username_set': {
        // optional UI feedback
        console.log('Username set:', p.username);
        break;
      }

      case 'error': {
        alert(`Server error: ${p.code} — ${p.message}`);
        break;
      }

      default:
        console.warn('Unknown server type', msg.type);
    }
  });
})();
