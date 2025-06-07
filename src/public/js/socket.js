import { renderRooms, joinRoom } from './rooms.js';
import { appendMessage, appendSystemMessage } from './messages.js';

function initializeSocket(state) {
  state.socket.on('rooms list', (rooms) => {
    renderRooms(rooms, state);

    if (!state.currentRoomId && rooms.some((r) => r.id === 'general')) {
      joinRoom('general', state);
    } else if (!state.currentRoomId && rooms.length > 0) {
      joinRoom(rooms[0].id, state);
    }
  });

  state.socket.on('new message', (message) => {
    appendMessage(message, state.username);
  });

  state.socket.on('user joined', (username) => {
    appendSystemMessage(`${username} has joined the room.`);
  });

  state.socket.on('user left', (username) => {
    appendSystemMessage(`${username} has left the room.`);
  });
}

export { initializeSocket };
