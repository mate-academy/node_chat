'use strict';

const { randomUUID } = require('crypto');

const MAX_USERNAME_LENGTH = 32;
const MAX_ROOM_NAME_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 2000;

class ChatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ChatError';
  }
}

function isNonEmptyString(value, maxLength) {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

class ChatService {
  constructor(repository) {
    this.repository = repository;
    this.state = repository.load();
    this.clients = new Map();
  }

  connect(client) {
    this.clients.set(client, { username: '', rooms: new Set() });
  }

  disconnect(client) {
    this.clients.delete(client);
  }

  getRooms() {
    return this.state.rooms;
  }

  getRoomMembers(roomId) {
    return [...this.clients]
      .filter(([, clientState]) => clientState.rooms.has(roomId))
      .map(([client]) => client);
  }

  setUsername(client, username) {
    if (!isNonEmptyString(username, MAX_USERNAME_LENGTH)) {
      throw new ChatError(
        `Username must be between 1 and ${MAX_USERNAME_LENGTH} characters.`,
      );
    }

    this.clients.get(client).username = username.trim();
  }

  createRoom(name) {
    if (!isNonEmptyString(name, MAX_ROOM_NAME_LENGTH)) {
      throw new ChatError(
        `Room name must be between 1 and ${MAX_ROOM_NAME_LENGTH} characters.`,
      );
    }

    const room = { id: randomUUID(), name: name.trim() };
    const nextState = {
      rooms: [...this.state.rooms, room],
      messages: { ...this.state.messages, [room.id]: [] },
    };

    this.saveState(nextState);

    return room;
  }

  renameRoom(roomId, name) {
    if (!isNonEmptyString(name, MAX_ROOM_NAME_LENGTH)) {
      throw new ChatError(
        `Room name must be between 1 and ${MAX_ROOM_NAME_LENGTH} characters.`,
      );
    }

    const room = this.findRoom(roomId);
    const renamedRoom = { ...room, name: name.trim() };
    const replaceRoom = (existingRoom) =>
      existingRoom.id === room.id ? renamedRoom : existingRoom;
    const nextState = {
      ...this.state,
      rooms: this.state.rooms.map(replaceRoom),
    };

    this.saveState(nextState);

    return renamedRoom;
  }

  joinRoom(client, roomId) {
    const room = this.findRoom(roomId);

    this.clients.get(client).rooms.add(room.id);

    const compareByTime = (first, second) =>
      first.time.localeCompare(second.time);
    const messages = [...(this.state.messages[room.id] || [])].sort(
      compareByTime,
    );

    return { room, messages };
  }

  deleteRoom(roomId) {
    const room = this.findRoom(roomId);
    const messages = { ...this.state.messages };

    delete messages[room.id];

    const nextState = {
      rooms: this.state.rooms.filter(
        (existingRoom) => existingRoom.id !== room.id,
      ),
      messages,
    };

    this.saveState(nextState);

    for (const clientState of this.clients.values()) {
      clientState.rooms.delete(room.id);
    }

    return room.id;
  }

  sendMessage(client, roomId, text) {
    const clientState = this.clients.get(client);

    if (!clientState.username) {
      throw new ChatError('Set a username before sending messages.');
    }

    if (!isNonEmptyString(text, MAX_MESSAGE_LENGTH)) {
      throw new ChatError(
        `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`,
      );
    }

    const room = this.findRoom(roomId);

    if (!clientState.rooms.has(room.id)) {
      throw new ChatError('Join the room before sending messages.');
    }

    const message = {
      id: randomUUID(),
      roomId: room.id,
      author: clientState.username,
      time: new Date().toISOString(),
      text: text.trim(),
    };
    const nextState = {
      ...this.state,
      messages: {
        ...this.state.messages,
        [room.id]: [...(this.state.messages[room.id] || []), message],
      },
    };

    this.saveState(nextState);

    return message;
  }

  findRoom(roomId) {
    const room =
      typeof roomId === 'string'
        ? this.state.rooms.find((existingRoom) => existingRoom.id === roomId)
        : undefined;

    if (!room) {
      throw new ChatError('Room not found.');
    }

    return room;
  }

  saveState(nextState) {
    this.repository.save(nextState);
    this.state = nextState;
  }
}

module.exports = { ChatError, ChatService };
