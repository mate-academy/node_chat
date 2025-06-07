import { joinRoom } from './rooms.js';

function initializeUI(state) {
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');
  const createRoomBtn = document.getElementById('create-room-btn');
  const renameRoomBtn = document.getElementById('rename-room-btn');
  const deleteRoomBtn = document.getElementById('delete-room-btn');
  const currentRoomName = document.getElementById('current-room-name');

  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const messageText = messageInput.value.trim();

    if (messageText && state.currentRoomId) {
      state.socket.emit('send message', messageText);
      messageInput.value = '';
    }
  });

  createRoomBtn.addEventListener('click', () => {
    const roomName = window.prompt('Enter a name for the new room:');

    if (roomName) {
      state.socket.emit('create room', roomName, (newRoomId) => {
        joinRoom(newRoomId, state);
      });
    }
  });

  renameRoomBtn.addEventListener('click', () => {
    if (!state.currentRoomId || state.currentRoomId === 'general') {
      window.alert('You cannot rename the General room.');

      return;
    }

    const newName = window.prompt(
      `Enter a new name for the room "${currentRoomName.textContent}":`,
    );

    if (newName) {
      state.socket.emit('rename room', {
        roomId: state.currentRoomId,
        newName,
      });
    }
  });

  deleteRoomBtn.addEventListener('click', () => {
    if (!state.currentRoomId || state.currentRoomId === 'general') {
      window.alert('You cannot delete the General room.');

      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete the room "${currentRoomName.textContent}"?`,
      )
    ) {
      state.socket.emit('delete room', state.currentRoomId);
      state.currentRoomId = null;
    }
  });
}

export { initializeUI };
