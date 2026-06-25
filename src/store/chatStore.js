'use strict';

const { randomUUID } = require('crypto');

const createChatStore = () => {
  const rooms = new Map();

  const serializeRoom = (room) => ({
    id: room.id,
    name: room.name,
    createdAt: room.createdAt,
    messages: [...room.messages],
  });

  const serializeRooms = () =>
    [...rooms.values()].map((room) => ({
      id: room.id,
      name: room.name,
      createdAt: room.createdAt,
      messageCount: room.messages.length,
    }));

  const createRoom = (name) => {
    const room = {
      id: randomUUID(),
      name,
      messages: [],
      createdAt: new Date().toISOString(),
    };

    rooms.set(room.id, room);

    return serializeRoom(room);
  };

  const generalRoom = createRoom('General');

  const getRoom = (roomId) => {
    const room = rooms.get(roomId);

    return room ? serializeRoom(room) : null;
  };

  const getState = () => ({
    rooms: serializeRooms(),
    defaultRoomId: generalRoom.id,
  });

  const renameRoom = (roomId, name) => {
    const room = rooms.get(roomId);

    if (!room) {
      return null;
    }

    room.name = name;

    return serializeRoom(room);
  };

  const deleteRoom = (roomId) => {
    if (!rooms.has(roomId)) {
      return {
        error: 'Not found',
        statusCode: 404,
      };
    }

    if (rooms.size === 1) {
      return {
        error: 'At least one room must remain',
        statusCode: 400,
      };
    }

    rooms.delete(roomId);

    return {};
  };

  const addMessage = (roomId, message) => {
    const room = rooms.get(roomId);

    if (!room) {
      return null;
    }

    const savedMessage = {
      id: randomUUID(),
      author: message.author,
      text: message.text,
      time: new Date().toISOString(),
    };

    room.messages.push(savedMessage);

    return savedMessage;
  };

  return {
    addMessage,
    createRoom,
    deleteRoom,
    getRoom,
    getState,
    renameRoom,
  };
};

module.exports = { createChatStore };
