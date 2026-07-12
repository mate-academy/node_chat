/* eslint-env browser */

const ROOMS_UPDATE_EVENT = 'rooms:update';
const ROOM_CREATE_EVENT = 'room:create';
const ROOM_JOIN_EVENT = 'room:join';
const ROOM_RENAME_EVENT = 'room:rename';
const ROOM_DELETE_EVENT = 'room:delete';

export function initRooms(socket) {
  const roomsList = document.getElementById('rooms-list');
  const createRoomBtn = document.getElementById('create-room-btn');
  const currentRoomName = document.getElementById('current-room-name');
  const messagesList = document.getElementById('messages-list');
  const messageForm = document.getElementById('message-form');

  let activeRoomId = null;

  const renderRooms = (rooms) => {
    roomsList.innerHTML = '';

    rooms.forEach((room) => {
      const li = document.createElement('li');

      li.className = `room-item ${room.id === activeRoomId ? 'room-item--active' : ''}`;
      li.dataset.id = room.id;

      const nameSpan = document.createElement('span');

      nameSpan.className = 'room-name';
      nameSpan.textContent = room.name;
      li.appendChild(nameSpan);

      // Додаємо кнопки тільки якщо це не базова кімната 'general'
      if (room.id !== 'general') {
        const actionsDiv = document.createElement('div');

        actionsDiv.className = 'room-actions';

        actionsDiv.innerHTML = `
          <button class="action-btn rename-btn" title="Перейменувати">✏️</button>
          <button class="action-btn delete-btn" title="Видалити">❌</button>
        `;
        li.appendChild(actionsDiv);
      }

      roomsList.appendChild(li);
    });
  };

  socket.on(ROOMS_UPDATE_EVENT, (rooms) => {
    renderRooms(rooms);

    // Якщо кімнату, в якій ми сиділи, хтось перейменував, оновлюємо заголовок
    if (activeRoomId) {
      const currentRoom = rooms.find((r) => r.id === activeRoomId);

      if (currentRoom) {
        currentRoomName.textContent = currentRoom.name;
      }
    }
  });

  createRoomBtn.addEventListener('click', () => {
    const roomName = prompt('Введіть назву нової кімнати:');

    if (roomName && roomName.trim()) {
      socket.emit(ROOM_CREATE_EVENT, roomName.trim());
    }
  });

  roomsList.addEventListener('click', (e) => {
    const targetItem = e.target.closest('.room-item');

    if (!targetItem) {
      return;
    }

    const roomId = targetItem.dataset.id;

    // 1. Обробка кліку на "Перейменувати"
    if (e.target.closest('.rename-btn')) {
      const currentName = targetItem.querySelector('.room-name').textContent;
      const newName = prompt('Введіть нову назву кімнати:', currentName);

      if (newName && newName.trim() && newName.trim() !== currentName) {
        socket.emit(ROOM_RENAME_EVENT, { roomId, newName: newName.trim() });
      }

      return; // Зупиняємо функцію, щоб не спрацював логік входу (join)
    }

    // 2. Обробка кліку на "Видалити"
    if (e.target.closest('.delete-btn')) {
      const isConfirmed = confirm(
        'Ви впевнені, що хочете видалити цю кімнату?',
      );

      if (isConfirmed) {
        socket.emit(ROOM_DELETE_EVENT, roomId);

        // Якщо ми видалили кімнату, в якій зараз знаходимось
        if (activeRoomId === roomId) {
          activeRoomId = null;
          currentRoomName.textContent = 'Оберіть кімнату';
          messagesList.innerHTML = '';
          messageForm.classList.add('hidden');
        }
      }

      return; // Зупиняємо функцію
    }

    if (targetItem.dataset.id === activeRoomId) {
      return;
    }

    const previousActive = roomsList.querySelector('.room-item--active');

    if (previousActive) {
      previousActive.classList.remove('room-item--active');
    }

    targetItem.classList.add('room-item--active');
    activeRoomId = targetItem.dataset.id;

    currentRoomName.textContent =
      targetItem.querySelector('.room-name').textContent;

    socket.emit(ROOM_JOIN_EVENT, activeRoomId);
  });
}
