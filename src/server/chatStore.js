'use strict';

const { randomUUID } = require('crypto');

const DEFAULT_ROOM_NAME = 'General';

function createMessage(author, text) {
  return {
    id: randomUUID(),
    author,
    time: new Date().toISOString(),
    text,
  };
}

function createRoom(name) {
  return {
    id: randomUUID(),
    name: name.trim(),
    messages: [],
  };
}

class ChatStore {
  constructor() {
    this.rooms = new Map();

    const general = createRoom(DEFAULT_ROOM_NAME);

    general.name = DEFAULT_ROOM_NAME;
    this.rooms.set(general.id, general);
    this.defaultRoomId = general.id;
  }

  getRoomsList() {
    return [...this.rooms.values()].map(({ id, name }) => ({
      id,
      name,
      isDefault: id === this.defaultRoomId,
    }));
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  addRoom(name) {
    const room = createRoom(name);

    this.rooms.set(room.id, room);

    return room;
  }

  renameRoom(roomId, name) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return null;
    }

    room.name = name.trim();

    return room;
  }

  deleteRoom(roomId) {
    if (roomId === this.defaultRoomId) {
      return false;
    }

    return this.rooms.delete(roomId);
  }

  addMessage(roomId, author, text) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return null;
    }

    const message = createMessage(author, text);

    room.messages.push(message);

    return message;
  }
}

module.exports = { ChatStore, DEFAULT_ROOM_NAME };
