'use strict';

const { randomUUID } = require('node:crypto');

const GENERAL_ROOM_ID = 'general';
const rooms = [
  {
    id: GENERAL_ROOM_ID,
    name: 'General',
    messages: [],
  },
];

const normalizeRoomName = (roomName) => roomName.trim().toLowerCase();

const getAllRooms = () => {
  return rooms.map((room) => ({
    ...room,
    messages: [...room.messages],
  }));
};

const getRoomById = (roomId) => {
  const room = rooms.find((item) => item.id === roomId);

  if (!room) {
    return null;
  }

  return {
    ...room,
    messages: [...room.messages],
  };
};

const hasRoomWithName = (roomName, excludeRoomId) => {
  const normalizedRoomName = normalizeRoomName(roomName);

  return rooms.some((room) => {
    if (excludeRoomId && room.id === excludeRoomId) {
      return false;
    }

    return normalizeRoomName(room.name) === normalizedRoomName;
  });
};

const createRoom = (roomName) => {
  const newRoom = {
    id: randomUUID(),
    name: roomName.trim(),
    messages: [],
  };

  rooms.push(newRoom);

  return {
    ...newRoom,
    messages: [],
  };
};

const addMessageToRoom = (roomId, author, text) => {
  const room = rooms.find((item) => item.id === roomId);

  if (!room) {
    return null;
  }

  const message = {
    author,
    time: new Date().toISOString(),
    text,
  };

  room.messages.push(message);

  return { ...message };
};

const updateRoom = (roomId, newRoomName) => {
  const room = rooms.find((item) => item.id === roomId);

  if (!room) {
    return null;
  }

  room.name = newRoomName.trim();

  return {
    ...room,
    messages: [...room.messages],
  };
};

const deleteRoom = (roomId) => {
  const roomIndex = rooms.findIndex((room) => room.id === roomId);

  if (roomIndex === -1) {
    return null;
  }

  const [deletedRoom] = rooms.splice(roomIndex, 1);

  return {
    ...deletedRoom,
    messages: [...deletedRoom.messages],
  };
};

const roomStore = {
  GENERAL_ROOM_ID,
  getAllRooms,
  getRoomById,
  hasRoomWithName,
  createRoom,
  addMessageToRoom,
  updateRoom,
  deleteRoom,
};

exports.roomStore = roomStore;
