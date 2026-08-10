import { ref, computed } from 'vue';

const WS_URL = 'ws://localhost:3001';

// ─── Shared State ────────────────────────────────────────────────────────────
const username = ref(localStorage.getItem('chat_username') || '');
const rooms = ref([]);
const activeRoomId = ref(null);
const roomMessages = ref({}); // { [roomId]: Message[] }
const connected = ref(false);
const connectionError = ref('');

let ws = null;
let reconnectTimer = null;

// ─── Computed ─────────────────────────────────────────────────────────────────
const activeMessages = computed(() =>
  activeRoomId.value ? (roomMessages.value[activeRoomId.value] ?? []) : []);

const activeRoom = computed(
  () => rooms.value.find((r) => r.id === activeRoomId.value) ?? null,
);

// ─── Connection ───────────────────────────────────────────────────────────────
function connect() {
  if (ws && ws.readyState < 2) {
    return;
  } // already open/connecting

  clearTimeout(reconnectTimer);
  connectionError.value = '';

  ws = new WebSocket(WS_URL);

  ws.addEventListener('open', () => {
    connected.value = true;
    connectionError.value = '';

    // Authenticate
    if (username.value) {
      send({ type: 'set_username', username: username.value });
    }
  });

  ws.addEventListener('message', ({ data }) => {
    let payload;

    try {
      payload = JSON.parse(data);
    } catch {
      return;
    }

    handleMessage(payload);
  });

  ws.addEventListener('close', () => {
    connected.value = false;
    reconnectTimer = setTimeout(connect, 3000);
  });

  ws.addEventListener('error', () => {
    connectionError.value = 'Cannot reach server. Retrying…';
    connected.value = false;
  });
}

function disconnect() {
  clearTimeout(reconnectTimer);
  ws?.close();
  ws = null;
}

function send(payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

// ─── Message Handler ──────────────────────────────────────────────────────────
function handleMessage(payload) {
  switch (payload.type) {
    case 'rooms_list':
      rooms.value = payload.rooms;
      break;

    case 'history':
      roomMessages.value = {
        ...roomMessages.value,
        [payload.roomId]: payload.messages,
      };
      break;

    case 'chat_message': {
      const msgs = roomMessages.value[payload.roomId] ?? [];

      roomMessages.value = {
        ...roomMessages.value,
        [payload.roomId]: [...msgs, payload.message],
      };
      break;
    }

    case 'room_deleted':
      if (activeRoomId.value === payload.roomId) {
        activeRoomId.value = null;
      }

      delete roomMessages.value[payload.roomId];
      break;

    default:
      break;
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────
function setUsername(name) {
  username.value = name.trim();
  localStorage.setItem('chat_username', username.value);
  send({ type: 'set_username', username: username.value });
}

function joinRoom(roomId) {
  activeRoomId.value = roomId;
  send({ type: 'join_room', roomId });
}

function createRoom(name) {
  send({ type: 'create_room', name });
}

function renameRoom(roomId, name) {
  send({ type: 'rename_room', roomId, name });
}

function deleteRoom(roomId) {
  send({ type: 'delete_room', roomId });
}

function sendMessage(text) {
  if (!text.trim() || !activeRoomId.value) {
    return;
  }

  send({ type: 'chat_message', text });
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function useChat() {
  return {
    // state
    username,
    rooms,
    activeRoomId,
    activeRoom,
    activeMessages,
    roomMessages,
    connected,
    connectionError,
    // actions
    connect,
    disconnect,
    setUsername,
    joinRoom,
    createRoom,
    renameRoom,
    deleteRoom,
    sendMessage,
  };
}
