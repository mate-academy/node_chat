'use strict';

const { v4: uuidv4 } = require('./utils/uuid');

const rooms = new Map();

const DEFAULT_ROOM_ID = 'general';

// Initialize with default room
rooms.set(DEFAULT_ROOM_ID, {
  id: DEFAULT_ROOM_ID,
  name: 'General',
  messages: [],
});

function getRooms() {
  return Array.from(rooms.values()).map(({ id, name }) => ({ id, name }));
}

function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

function createRoom(name) {
  const id = uuidv4();

  const room = {
    id,
    name,
    messages: [],
  };

  rooms.set(id, room);

  return { id, name };
}

function renameRoom(roomId, newName) {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  room.name = newName;

  return { id: room.id, name: room.name };
}

function deleteRoom(roomId) {
  if (roomId === DEFAULT_ROOM_ID) {
    return false;
  }

  return rooms.delete(roomId);
}

function getRoomMessages(roomId) {
  const room = rooms.get(roomId);

  return room ? room.messages : [];
}

function addMessage(roomId, author, text) {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  const message = {
    author,
    text,
    time: new Date().toISOString(),
  };

  room.messages.push(message);

  return message;
}

module.exports = {
  DEFAULT_ROOM_ID,
  getRooms,
  getRoom,
  createRoom,
  renameRoom,
  deleteRoom,
  getRoomMessages,
  addMessage,
};
