// Connect to Socket.IO
const socket = io();

// DOM Elements
const roomList = document.getElementById('room-list');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const currentRoomName = document.getElementById('current-room-name');
const usernameDisplay = document.getElementById('username-display');
const newRoomNameInput = document.getElementById('new-room-name');
const createRoomBtn = document.getElementById('create-room-btn');

let currentRoomId = null;
let username = localStorage.getItem('chatUsername');

// 1. Handle Username
if (!username) {
  username = prompt('Please enter your username:');

  if (username) {
    localStorage.setItem('chatUsername', username);
  } else {
    username = 'Anonymous';
  }
}
usernameDisplay.textContent = `Logged in as: ${username}`;

// 2. Fetch and Render Rooms (NOW WITH RENAME & DELETE BUTTONS)
async function fetchRooms() {
  try {
    const res = await fetch('/api/rooms');
    const rooms = await res.json();

    roomList.innerHTML = '';

    rooms.forEach((room) => {
      const li = document.createElement('li');

      // Create the room name span
      const nameSpan = document.createElement('span');

      nameSpan.textContent = room.name;
      nameSpan.onclick = () => joinRoom(room._id, room.name, li);
      li.appendChild(nameSpan);

      // Create the actions container
      const actionsDiv = document.createElement('div');

      actionsDiv.className = 'room-item-actions';

      // Rename Button
      const renameBtn = document.createElement('button');

      renameBtn.textContent = '✏️';

      renameBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent joining the room when clicking rename
        renameRoom(room._id, room.name);
      };

      // Delete Button
      const deleteBtn = document.createElement('button');

      deleteBtn.textContent = '🗑️';

      deleteBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent joining the room when clicking delete
        deleteRoom(room._id);
      };

      actionsDiv.appendChild(renameBtn);
      actionsDiv.appendChild(deleteBtn);
      li.appendChild(actionsDiv);

      roomList.appendChild(li);
    });
  } catch (err) {
    console.error('Error fetching rooms:', err);
  }
}

// 3. Join a Room
function joinRoom(roomId, roomName, element) {
  // Leave previous room if any
  if (currentRoomId) {
    socket.emit('leaveRoom', { roomId: currentRoomId, username });
  }

  // Update UI
  document
    .querySelectorAll('#room-list li')
    .forEach((li) => li.classList.remove('active'));

  if (element) {
    element.classList.add('active');
  }

  currentRoomId = roomId;
  currentRoomName.textContent = roomName;
  messagesContainer.innerHTML = ''; // Clear old messages

  // Enable inputs
  messageInput.disabled = false;
  sendBtn.disabled = false;
  messageInput.focus();

  // Emit join event to server
  socket.emit('joinRoom', { roomId, username });
}

// 4. Create a Room
createRoomBtn.onclick = async () => {
  const roomName = newRoomNameInput.value.trim();

  if (!roomName) {
    return;
  }

  try {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName }),
    });
    const data = await res.json();

    if (res.ok) {
      newRoomNameInput.value = '';
      fetchRooms(); // Refresh the room list
    } else {
      alert(data.error || 'Failed to create room');
    }
  } catch (err) {
    console.error('Error creating room:', err);
  }
};

// 5. Rename a Room (NEW - Uses Socket.IO for real-time update)
function renameRoom(roomId, currentName) {
  const newName = prompt('Enter new room name:', currentName);

  if (!newName || newName === currentName) {
    return;
  }

  // Emit the socket event instead of using fetch
  socket.emit('renameRoom', { roomId, newName });
}

// 6. Delete a Room (NEW - Uses REST API)
async function deleteRoom(roomId) {
  if (
    !confirm(
      'Are you sure you want to delete this room? All messages will be lost.',
    )
  ) {
    return;
  }

  try {
    const res = await fetch(`/api/rooms/${roomId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      // If we deleted the room we are currently in, reset the UI
      if (currentRoomId === roomId) {
        currentRoomId = null;
        currentRoomName.textContent = 'Select a Room';
        messagesContainer.innerHTML = '';
        messageInput.disabled = true;
        sendBtn.disabled = true;
      }
      fetchRooms(); // Refresh list
    } else {
      const data = await res.json();

      alert(data.error || 'Failed to delete room');
    }
  } catch (err) {
    console.error('Error deleting room:', err);
  }
}

// 7. Send a Message
sendBtn.onclick = () => {
  const text = messageInput.value.trim();

  if (!text || !currentRoomId) {
    return;
  }

  socket.emit('sendMessage', { roomId: currentRoomId, author: username, text });
  messageInput.value = '';
};

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});

// 8. Handle Incoming Socket Events
socket.on('messageHistory', (messages) => {
  messagesContainer.innerHTML = '';
  messages.forEach(addMessageToUI);
});

socket.on('message', (message) => {
  addMessageToUI(message);
});

socket.on('roomCreated', () => {
  fetchRooms(); // Refresh the room list when someone else creates a room
});

// NEW: Listen for real-time rename broadcast from the server
socket.on('roomRenamed', (updatedRoom) => {
  fetchRooms(); // Refresh the sidebar for ALL connected users

  // If the current user is inside the room that got renamed
  if (currentRoomId === updatedRoom._id) {
    currentRoomName.textContent = updatedRoom.name;
  }
});

// Helper function to render a message
function addMessageToUI(message) {
  const div = document.createElement('div');

  div.classList.add('message');

  if (message.author === username) {
    div.classList.add('own');
  }

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  div.innerHTML = `
    <div class="meta">${message.author} • ${time}</div>
    <div class="text">${message.text}</div>
  `;

  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll
}

// Initial Fetch
fetchRooms();
