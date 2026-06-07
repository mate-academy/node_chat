/* eslint-disable no-console, no-undef */
const roomsList = document.querySelector('#rooms-list');
const messagesList = document.querySelector('#messages-list');
const activeRoomTitle = document.querySelector('#active-room-title');

const createRoomForm = document.querySelector('#create-room-form');
const roomNameInput = document.querySelector('#room-name-input');
const messageForm = document.querySelector('#message-form');
const messageFormRoomName = document.querySelector(
  '#message-form input[name="room"]',
);
const messageFormAuthorName = document.querySelector(
  '#message-form input[name="author"]',
);

const state = {
  rooms: [],
  activeRoomId: null,
};

const addMessageToDom = (message) => {
  messagesList.insertAdjacentHTML(
    'beforeend',
    `
    <li class="message-list__item">
      <div class="message-list__meta">
        <span class="message-list__author">${message.author}</span>
        <span>${message.time}</span>
      </div>
      <p class="message-list__text">${message.text}</p>
    </li>
    `,
  );
};

const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const socket = new WebSocket(`${socketProtocol}//${window.location.host}`);

socket.addEventListener('message', (event) => {
  try {
    const payload = JSON.parse(event.data);

    if (
      payload.type === 'message_created' &&
      payload.roomId === state.activeRoomId
    ) {
      addMessageToDom(payload.message);
    }
  } catch {
    console.log(`Invalid websocket payload: ${event.data}`);
  }
});

const createRoomFetch = (roomName) => {
  return fetch('/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: roomName }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    roomNameInput.value = '';

    return response.json();
  });
};

const getRoomsFetch = () => {
  return fetch('/rooms', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to load rooms');
    }

    return response.json();
  });
};

const getRoomByIdFetch = (roomId) => {
  return fetch(`/rooms/${roomId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to get room by Id');
    }

    return response.json();
  });
};

const deleteRoomFetch = (roomId) => {
  return fetch(`/rooms/${roomId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to delete rooms');
    }

    return response.json();
  });
};

const updateRoomNameFetch = (roomId, roomName) => {
  return fetch(`/rooms/${roomId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: roomName }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to change room name');
    }

    return response.json();
  });
};

createRoomForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const roomName = roomNameInput.value.trim();

  if (!roomName) {
    return;
  }

  await createRoomFetch(roomName);
  await loadRooms();

  renderRooms(state.rooms);
});

function renderRooms(data) {
  // clear before append
  [...roomsList.children].forEach((el) => {
    roomsList.removeChild(el);
  });

  // append data to DOM
  data.forEach((element) => {
    roomsList.insertAdjacentHTML(
      'beforeend',
      `
    <li class="room-list__item" id='${element.id}' data-mode="view">
      <div class="room-list__view">
        <button
          class="button button--ghost room-list__button"
          data-room='${element.id}'
          type="button"
        >
          ${element.name}
        </button>
        <button
          class="button button--ghost"
          data-edit='${element.id}'
          type="button"
        >
          Edit
        </button>
      </div>

      <form class="room-list__edit">
        <input
          class="form__input"
          type="text"
          name="roon"
          value="${element.name}"
          required
          minlength="3"
        />
        <div class="room-list__actions">
          <button
            class="button button--primary"
            data-save='${element.id}'
            type="submit"
          >
            Save
          </button>
        </div>
      </form>

      <button
        class="button button--danger room-list__delete"
        data-delete='${element.id}'
        type="button"
      >
        Delete
      </button>
    </li>
    `,
    );
  });
}

function authorMemory(author) {
  const storage = window.localStorage;

  if (author) {
    storage.removeItem('author');
    storage.setItem('author', author);
  }

  if (storage.getItem('author')) {
    return storage.getItem('author');
  }
}

messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  const author = formData.get('author');
  const text = formData.get('text');

  if (
    state.activeRoomId !== null &&
    typeof author === 'string' &&
    typeof text === 'string' &&
    author.trim() !== '' &&
    text.trim() !== ''
  ) {
    socket.send(
      JSON.stringify({
        type: 'send_message',
        roomId: state.activeRoomId,
        author: author.trim(),
        text: text.trim(),
      }),
    );

    authorMemory(author);
    event.currentTarget.reset();
    messageFormRoomName.value = activeRoomTitle.innerText;
    messageFormAuthorName.value = authorMemory();
  }
});

function renderMessage(data) {
  // clear before append
  [...messagesList.children].forEach((el) => {
    messagesList.removeChild(el);
  });

  if (data.length) {
    data.forEach((element) => {
      addMessageToDom(element);
    });
  }
}

async function loadRooms() {
  const data = await getRoomsFetch();

  state.rooms = data.rooms;
}

async function init() {
  await loadRooms();

  renderRooms(state.rooms);
  messageFormAuthorName.value = authorMemory();
}

init();

roomsList.addEventListener('click', async (event) => {
  const roomId = event.target.dataset.room;
  const deleteRoom = event.target.dataset.delete;
  const editRoom = event.target.dataset.edit;
  const saveRoom = event.target.dataset.save;
  const liEl = event.target.parentElement.parentElement;

  if (roomId) {
    const roomMessage = await getRoomByIdFetch(roomId);
    const roomName = roomMessage.room.name;

    state.activeRoomId = roomId;

    socket.send(
      JSON.stringify({
        type: 'join_room',
        roomId,
      }),
    );

    activeRoomTitle.innerText = roomName;
    messageFormRoomName.value = roomName;

    renderMessage(roomMessage.room.messages);
  }

  if (deleteRoom) {
    const deleteFallbackRoomId = await deleteRoomFetch(deleteRoom);

    state.activeRoomId = deleteFallbackRoomId.fallbackRoomId;

    await loadRooms();
    renderRooms(state.rooms);

    const fallbackRoom = await getRoomByIdFetch(
      deleteFallbackRoomId.fallbackRoomId,
    );

    activeRoomTitle.innerText = fallbackRoom.room.name;
    messageFormRoomName.value = fallbackRoom.room.name;
    renderMessage(fallbackRoom.room.messages);
  }

  if (editRoom) {
    if (liEl.dataset.mode === 'view') {
      liEl.dataset.mode = 'edit';
    } else {
      liEl.dataset.mode = 'view';
    }
  }

  if (saveRoom) {
    event.preventDefault();

    const formData = new FormData(event.target.parentElement.parentElement);
    const roomNewName = formData.get('roon');

    await updateRoomNameFetch(saveRoom, roomNewName);
    await loadRooms();
    renderRooms(state.rooms);
  }
});
