import { saveUser } from "./users.js";
import {
  getRooms,
  createRoom,
  renameRoom,
  deleteRoom
} from "./rooms.js";
import { formatTime } from "./utils.js";
import { joinRoom, leaveRoom, onMessage, sendMessage } from "./webSocket.js";
import { createRoomElement } from "./roomUI.js";


const chatForm = document.getElementById('username-form');
const nameInput = document.getElementById('username');
const chat = document.getElementById('chat');
const rooms = document.getElementById('rooms');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');
const roomForm = document.getElementById('room-form');
const roomInput = document.getElementById('room-input');

let currentRoom = null;

function updateMessageForm(currentRoom) {
  if (currentRoom === null) {
    messageForm.style.display = 'none'
  } else {
    messageForm.style.display = ''
  }
};


function updateUI(value) {
  if (value) {
    chatForm.style.display = 'none';
    chat.style.display = '';
    getRooms(rooms);
  } else {
    chat.style.display = 'none';
  }
};


updateMessageForm(currentRoom);

const value = localStorage.getItem('username');

updateUI(value);


chatForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const username = nameInput.value.trim();

  if (username === '') {
    return;
  }

  const success = await saveUser(username);

  if (!success) {
    return;
  };

  localStorage.setItem('username', username);
  updateUI(username);
});


onMessage((data) => {
  if (data.type === 'room-history') {
    const oldMessages = data.messages;

    oldMessages.forEach(message => {
      const newMessage = document.createElement('li');
      newMessage.textContent = message.author + ' ' + formatTime(message.time) + ' ' + message.text;

      messages.appendChild(newMessage);
    })

  } else {
    const newMessage = document.createElement('li');

    newMessage.textContent = data.author + ' ' + formatTime(data.time) + ' ' + data.text;

    messages.appendChild(newMessage);
    messageInput.value = '';
  }

});


messageForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const message = {
    text: messageInput.value,
    author: localStorage.getItem('username'),
    time: new Date(),
    room: currentRoom
  };

  if (message.room === null) {
    return;
  }

  if (message.text.trim() === '') {
    return;
  }

  sendMessage(message);
});


rooms.addEventListener('click', async (event) => {
  if (event.target.dataset.rename) {
    const roomContainer = event.target.parentElement;
    const renameBtn = roomContainer.querySelector('[data-rename]');
    renameBtn.style.display = 'none';

    const roomElement = roomContainer.querySelector('[data-room]');
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.value = roomElement.dataset.room;
    newInput.dataset.oldRoom = roomElement.dataset.room;

    roomElement.replaceWith(newInput);

    let saveButton = roomContainer.querySelector('[data-save]');
    const deleteButton = roomContainer.querySelector('[data-delete]');

    if (!saveButton) {
      saveButton = document.createElement('button');
      saveButton.textContent = 'Save';
      saveButton.dataset.save = 'save';
      roomContainer.appendChild(saveButton);
    }

    saveButton.style.display = '';
    deleteButton.style.display = 'none';

  } else if (event.target.dataset.save) {
    const roomContainer = event.target.parentElement;
    const input = roomContainer.querySelector('input');
    const newName = input.value;
    const oldName = input.dataset.oldRoom;
    const deleteButton = roomContainer.querySelector('[data-delete]');

    const roomExists = document.querySelector(`[data-room="${newName}"]`);

    if (roomExists && oldName !== newName) {
      return;
    }

    const result = await renameRoom(oldName, newName);

    const newRoom = document.createElement('button');

    newRoom.dataset.room = result;
    newRoom.textContent = result;

    input.replaceWith(newRoom);

    const saveBtn = roomContainer.querySelector('[data-save]');
    saveBtn.style.display = 'none';

    const renameBtn = roomContainer.querySelector('[data-rename]');
    renameBtn.style.display = '';

    if (currentRoom === oldName) {
      currentRoom = result;
      joinRoom(currentRoom);
      messages.innerHTML = '';
    }

    deleteButton.style.display = '';

  } else if (event.target.dataset.delete) {
    const roomContainer = event.target.parentElement;
    const room = roomContainer.querySelector('[data-room]');
    const result = await deleteRoom(room.dataset.room);

    rooms.removeChild(roomContainer);

    const roomName = room.dataset.room;

    if (roomName === currentRoom) {
      if (result.length > 0) {
        currentRoom = result[0];
        const activeRoom = document.querySelector(`[data-room="${currentRoom}"]`);
  activeRoom.classList.add('active');
        updateMessageForm(currentRoom);
        joinRoom(currentRoom);
        messages.innerHTML = '';
      } else {
        currentRoom = null;
        updateMessageForm(currentRoom);
        leaveRoom();
        messages.innerHTML = '';
      }
    }

  } else if (event.target.dataset.room) {
    currentRoom = event.target.dataset.room;

  rooms.querySelectorAll('[data-room]').forEach((button) => {
    button.classList.remove('active');
  });

  event.target.classList.add('active');

  updateMessageForm(currentRoom);

  joinRoom(currentRoom);

  messages.innerHTML = '';
  }
});


roomForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const newRoom = roomInput.value.trim();

  if (newRoom === '') {
    return;
  }

  const roomExists = document.querySelector(`[data-room="${newRoom}"]`);

  if (roomExists) {
    return;
  }

  const result = await createRoom(newRoom);

  currentRoom = result;

  updateMessageForm(currentRoom);

  joinRoom(currentRoom);

  messages.innerHTML = '';

  const element = createRoomElement(currentRoom);

  rooms.appendChild(element);

  rooms.querySelectorAll('[data-room]').forEach((button) => {
  button.classList.remove('active');
});

  element.querySelector('[data-room]').classList.add('active');

  roomInput.value = '';

  joinRoom(currentRoom)
});

