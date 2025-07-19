/* eslint-env browser */
/* global io */

class ChatApp {
  constructor() {
    this.socket = io();
    this.username = localStorage.getItem('chat-username') || '';
    this.currentRoom = null;

    this.initializeElements();
    this.setupEventListeners();
    this.setupSocketListeners();

    if (this.username) {
      this.showChatApp();
    }
  }

  initializeElements() {
    this.loginScreen = document.getElementById('loginScreen');
    this.chatApp = document.getElementById('chatApp');
    this.usernameInput = document.getElementById('usernameInput');
    this.setUsernameBtn = document.getElementById('setUsernameBtn');
    this.currentUsernameSpan = document.getElementById('currentUsername');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.roomsList = document.getElementById('roomsList');
    this.currentRoomName = document.getElementById('currentRoomName');
    this.messagesContainer = document.getElementById('messagesContainer');
    this.messageInput = document.getElementById('messageInput');
    this.sendMessageBtn = document.getElementById('sendMessageBtn');

    this.messageInputContainer = document.getElementById(
      'messageInputContainer',
    );
    this.createRoomBtn = document.getElementById('createRoomBtn');
    this.renameRoomBtn = document.getElementById('renameRoomBtn');
    this.deleteRoomBtn = document.getElementById('deleteRoomBtn');

    this.createRoomModal = document.getElementById('createRoomModal');
    this.newRoomNameInput = document.getElementById('newRoomNameInput');
    this.confirmCreateRoomBtn = document.getElementById('confirmCreateRoomBtn');
    this.cancelCreateRoomBtn = document.getElementById('cancelCreateRoomBtn');

    this.renameRoomModal = document.getElementById('renameRoomModal');
    this.renameRoomInput = document.getElementById('renameRoomInput');
    this.confirmRenameRoomBtn = document.getElementById('confirmRenameRoomBtn');
    this.cancelRenameRoomBtn = document.getElementById('cancelRenameRoomBtn');
  }

  setupEventListeners() {
    this.setUsernameBtn.addEventListener('click', () => this.setUsername());

    this.usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.setUsername();
      }
    });

    this.logoutBtn.addEventListener('click', () => this.logout());

    this.createRoomBtn.addEventListener('click', () =>
      this.showCreateRoomModal(),
    );

    this.renameRoomBtn.addEventListener('click', () =>
      this.showRenameRoomModal(),
    );
    this.deleteRoomBtn.addEventListener('click', () => this.deleteRoom());

    this.sendMessageBtn.addEventListener('click', () => this.sendMessage());

    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    this.confirmCreateRoomBtn.addEventListener('click', () =>
      this.createRoom(),
    );

    this.cancelCreateRoomBtn.addEventListener('click', () =>
      this.hideCreateRoomModal(),
    );

    this.newRoomNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.createRoom();
      }
    });

    this.confirmRenameRoomBtn.addEventListener('click', () =>
      this.renameRoom(),
    );

    this.cancelRenameRoomBtn.addEventListener('click', () =>
      this.hideRenameRoomModal(),
    );

    this.renameRoomInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.renameRoom();
      }
    });

    this.createRoomModal.addEventListener('click', (e) => {
      if (e.target === this.createRoomModal) {
        this.hideCreateRoomModal();
      }
    });

    this.renameRoomModal.addEventListener('click', (e) => {
      if (e.target === this.renameRoomModal) {
        this.hideRenameRoomModal();
      }
    });
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      if (this.username && this.currentRoom) {
        this.socket.emit('join-room', {
          username: this.username,
          roomName: this.currentRoom,
        });
      }
    });

    this.socket.on('rooms-list', (rooms) => {
      this.updateRoomsList(rooms);
    });

    this.socket.on('room-created', (data) => {
      this.hideCreateRoomModal();
      this.socket.emit('get-rooms');
      this.joinRoom(data.roomName);
    });

    this.socket.on('room-history', (messages) => {
      this.displayMessages(messages);
    });

    this.socket.on('new-message', (message) => {
      this.displayMessage(message);
    });

    this.socket.on('user-joined', (data) => {
      this.displaySystemMessage(`${data.username} joined the room`);
    });

    this.socket.on('user-left', (data) => {
      this.displaySystemMessage(`${data.username} left the room`);
    });

    this.socket.on('room-deleted', (data) => {
      if (this.currentRoom === data.roomName) {
        this.currentRoom = null;
        this.currentRoomName.textContent = 'Select a room';

        this.messagesContainer.innerHTML = `
          <div class="no-room-message">
            <p>Please select or create a room to start chatting</p>
          </div>
        `;
        this.messageInputContainer.style.display = 'none';
        this.renameRoomBtn.style.display = 'none';
        this.deleteRoomBtn.style.display = 'none';
      }
      this.socket.emit('get-rooms');
    });

    this.socket.on('room-renamed', (data) => {
      if (this.currentRoom === data.oldName) {
        this.currentRoom = data.newName;
        this.currentRoomName.textContent = data.newName;
      }
      this.hideRenameRoomModal();
      this.socket.emit('get-rooms');
    });

    this.socket.on('room-error', (data) => {
      alert(data.message);
    });
  }

  setUsername() {
    const username = this.usernameInput.value.trim();

    if (username) {
      this.username = username;
      localStorage.setItem('chat-username', username);
      this.showChatApp();
    }
  }

  showChatApp() {
    this.currentUsernameSpan.textContent = this.username;
    this.loginScreen.style.display = 'none';
    this.chatApp.style.display = 'flex';
    this.socket.emit('get-rooms');
  }

  logout() {
    this.username = '';
    this.currentRoom = null;
    localStorage.removeItem('chat-username');
    this.loginScreen.style.display = 'block';
    this.chatApp.style.display = 'none';
    this.usernameInput.value = '';
    this.socket.disconnect();
    this.socket.connect();
  }

  updateRoomsList(rooms) {
    this.roomsList.innerHTML = '';

    rooms.forEach((room) => {
      const roomElement = document.createElement('div');

      roomElement.className = 'room-item';
      roomElement.textContent = room;
      roomElement.addEventListener('click', () => this.joinRoom(room));

      if (room === this.currentRoom) {
        roomElement.classList.add('active');
      }

      this.roomsList.appendChild(roomElement);
    });
  }

  joinRoom(roomName) {
    if (this.currentRoom) {
      document.querySelector('.room-item.active')?.classList.remove('active');
    }

    this.currentRoom = roomName;
    this.currentRoomName.textContent = roomName;
    this.messageInputContainer.style.display = 'flex';
    this.renameRoomBtn.style.display = 'inline-block';
    this.deleteRoomBtn.style.display = 'inline-block';

    const roomElement = Array.from(this.roomsList.children).find(
      (el) => el.textContent === roomName,
    );

    if (roomElement) {
      roomElement.classList.add('active');
    }

    this.socket.emit('join-room', {
      username: this.username,
      roomName: roomName,
    });
  }

  showCreateRoomModal() {
    this.createRoomModal.style.display = 'block';
    this.newRoomNameInput.focus();
  }

  hideCreateRoomModal() {
    this.createRoomModal.style.display = 'none';
    this.newRoomNameInput.value = '';
  }

  createRoom() {
    const roomName = this.newRoomNameInput.value.trim();

    if (roomName) {
      this.socket.emit('create-room', {
        roomName: roomName,
        username: this.username,
      });
    }
  }

  showRenameRoomModal() {
    if (this.currentRoom) {
      this.renameRoomInput.value = this.currentRoom;
      this.renameRoomModal.style.display = 'block';
      this.renameRoomInput.focus();
    }
  }

  hideRenameRoomModal() {
    this.renameRoomModal.style.display = 'none';
    this.renameRoomInput.value = '';
  }

  renameRoom() {
    const newName = this.renameRoomInput.value.trim();

    if (newName && newName !== this.currentRoom) {
      this.socket.emit('rename-room', {
        oldName: this.currentRoom,
        newName: newName,
      });
    }
  }

  deleteRoom() {
    if (
      this.currentRoom &&
      confirm(`Are you sure you want to delete the room "${this.currentRoom}"?`)
    ) {
      this.socket.emit('delete-room', { roomName: this.currentRoom });
    }
  }

  sendMessage() {
    const message = this.messageInput.value.trim();

    if (message && this.currentRoom) {
      this.socket.emit('send-message', {
        message: message,
        roomName: this.currentRoom,
        username: this.username,
      });
      this.messageInput.value = '';
    }
  }

  displayMessages(messages) {
    this.messagesContainer.innerHTML = '';
    messages.forEach((message) => this.displayMessage(message));
    this.scrollToBottom();
  }

  displayMessage(message) {
    const messageElement = document.createElement('div');

    messageElement.className = 'message';

    const formattedTime = this.formatTimestamp(message.timestamp);

    messageElement.innerHTML = `
      <div class="message-header">
        <span class="message-author">${this.escapeHtml(message.username)}</span>
        <span class="message-time">${formattedTime}</span>
      </div>
      <div class="message-text">${this.escapeHtml(message.message)}</div>
    `;

    this.messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  displaySystemMessage(text) {
    const messageElement = document.createElement('div');

    messageElement.className = 'system-message';
    messageElement.textContent = text;
    this.messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');

    div.textContent = text;

    return div.innerHTML;
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-new
  new ChatApp();
});
