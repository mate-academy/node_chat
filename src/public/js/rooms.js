function renderRooms(rooms, state) {
  const roomList = document.getElementById('room-list');

  roomList.innerHTML = '';

  rooms.forEach((room) => {
    const roomElement = document.createElement('button');

    roomElement.textContent = room.name;
    roomElement.dataset.roomId = room.id;

    roomElement.className = `w-full text-left p-2 rounded-md transition duration-200 ${
      room.id === state.currentRoomId
        ? 'bg-indigo-600 font-bold'
        : 'hover:bg-gray-700'
    }`;
    roomElement.addEventListener('click', () => joinRoom(room.id, state));
    roomList.appendChild(roomElement);
  });
}

function joinRoom(roomId, state) {
  if (roomId === state.currentRoomId) {
    return;
  }

  state.socket.emit('join room', roomId, (response) => {
    if (response.status === 'ok') {
      state.currentRoomId = roomId;
      updateCurrentRoomDisplay(roomId);
      clearAndLoadMessages(response.messages, state.username);
      updateRoomListStyles(roomId);
    } else {
      window.alert(`Error joining room: ${response.message}`);
    }
  });
}

function updateCurrentRoomDisplay(roomId) {
  const currentRoomName = document.getElementById('current-room-name');
  const roomList = document.getElementById('room-list');
  const roomData = Array.from(roomList.children).find(
    (el) => el.dataset.roomId === roomId,
  );

  currentRoomName.textContent = roomData ? roomData.textContent : 'Room';
}

function clearAndLoadMessages(messages, username) {
  const messagesContainer = document.getElementById('messages');

  messagesContainer.innerHTML = '';

  messages.forEach((message) => {
    import('./messages.js').then(({ appendMessage }) => {
      appendMessage(message, username);
    });
  });
}

function updateRoomListStyles(currentRoomId) {
  const roomList = document.getElementById('room-list');

  Array.from(roomList.children).forEach((el) => {
    const isActive = el.dataset.roomId === currentRoomId;

    el.classList.toggle('bg-indigo-600', isActive);
    el.classList.toggle('font-bold', isActive);
    el.classList.toggle('hover:bg-gray-700', !isActive);
  });
}

export { renderRooms, joinRoom };
