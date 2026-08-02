'use strict';

const DEFAULT_ROOM_ID = 'general';

// In-memory storage: roomId -> { id, name, messages: [{ author, time, text }] }
const rooms = new Map();

rooms.set(DEFAULT_ROOM_ID, {
  id: DEFAULT_ROOM_ID,
  name: 'General',
  messages: [],
});

function generateRoomId() {
  return `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getRoomList() {
  return [...rooms.values()].map(({ id, name }) => ({ id, name }));
}

function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

function roomExists(roomId) {
  return rooms.has(roomId);
}

function createRoom(name) {
  const room = {
    id: generateRoomId(),
    name,
    messages: [],
  };

  rooms.set(room.id, room);

  return room;
}

function renameRoom(roomId, name) {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  room.name = name;

  return room;
}

// The default room is never deleted so there is always somewhere to chat.
function deleteRoom(roomId) {
  if (roomId === DEFAULT_ROOM_ID) {
    return false;
  }

  return rooms.delete(roomId);
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
  getRoomList,
  getRoom,
  roomExists,
  createRoom,
  renameRoom,
  deleteRoom,
  addMessage,
};
