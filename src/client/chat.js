/* eslint-env browser */
import { fail } from './utils.js';
import { state, LS_ROOM } from './state.js';
import { api } from './api.js';
import { renderRooms, renderTitle } from './components/roomList.js';
import { renderMessages, appendMessage } from './components/messageList.js';
import { showGate } from './components/username.js';

const refreshRooms = () => renderRooms(joinRoom);

export async function joinRoom(id, keepMessages) {
  state.current = id;
  localStorage.setItem(LS_ROOM, id);

  if (!keepMessages) {
    state.msgs = [];
    renderMessages(true);
  }
  refreshRooms();
  renderTitle();

  try {
    // Histórico completo da sala
    const data = await api('GET', '/api/rooms/' + id + '/messages');

    if (state.current !== id) {
      return;
    }

    const seen = new Set(data.messages.map((m) => m.id));

    // Mantém mensagens que chegaram em tempo real durante o carregamento
    state.msgs.forEach((m) => {
      if (!seen.has(m.id)) {
        data.messages.push(m);
      }
    });
    data.messages.sort((a, b) => a.ts - b.ts);

    state.msgs = data.messages;
    renderMessages(true);
  } catch (err) {
    fail(err);
  }
}

export function setRooms(list, reload) {
  state.rooms = list;

  if (!list.some((r) => r.id === state.current)) {
    joinRoom(list[0].id);

    return;
  }
  refreshRooms();
  renderTitle();

  if (reload) {
    joinRoom(state.current, true);
  }
}

export function onRoomCreated(room) {
  if (!state.rooms.some((r) => r.id === room.id)) {
    state.rooms.push(room);
  }
  joinRoom(room.id);
}

export function receiveMessage({ roomId, message }) {
  if (roomId !== state.current) {
    return;
  }

  if (state.msgs.some((m) => m.id === message.id)) {
    return;
  }
  state.msgs.push(message);
  appendMessage(message);
}

export function sendMessage(text) {
  if (!state.current) {
    return Promise.resolve();
  }

  if (!state.user) {
    showGate();

    return Promise.reject(new Error('Defina seu nome para enviar mensagens.'));
  }

  return api('POST', '/api/rooms/' + state.current + '/messages', {
    author: state.user,
    text,
  });
}
