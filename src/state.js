'use strict';

const DEFAULT_ROOM = 'general';

class ChatState {
  constructor() {
    this.rooms = new Map([
      [
        DEFAULT_ROOM,
        { id: DEFAULT_ROOM, name: 'General Chat', createdBy: 'System' },
      ],
    ]);
    this.messages = new Map([[DEFAULT_ROOM, []]]);
    this.activeClients = new Map();
  }

  getDefaultRoomId() {
    return DEFAULT_ROOM;
  }

  hasRoom(roomName) {
    if (!roomName) {
      return false;
    }

    return this.rooms.has(roomName.trim().toLowerCase());
  }

  getRoom(roomName) {
    if (!roomName) {
      return null;
    }

    return this.rooms.get(roomName.trim().toLowerCase());
  }

  createRoom(name, creator) {
    const cleanKey = name.trim().toLowerCase();

    if (this.rooms.has(cleanKey)) {
      return null;
    }

    const newRoom = {
      id: cleanKey,
      name: name.trim(),
      createdBy: creator,
    };

    this.rooms.set(cleanKey, newRoom);
    this.messages.set(cleanKey, []);

    return newRoom;
  }

  renameRoom(roomId, newName) {
    const cleanKey = roomId.trim().toLowerCase();
    const room = this.rooms.get(cleanKey);

    if (room && newName.trim()) {
      room.name = newName.trim();

      return room;
    }

    return null;
  }

  deleteRoom(roomName) {
    const cleanKey = roomName.trim().toLowerCase();

    if (cleanKey === DEFAULT_ROOM) {
      return false;
    }

    if (this.rooms.has(cleanKey)) {
      this.rooms.delete(cleanKey);
      this.messages.delete(cleanKey);

      return true;
    }

    return false;
  }

  getHistory(roomName) {
    const cleanKey = roomName.trim().toLowerCase();

    return this.messages.get(cleanKey) || [];
  }

  addMessage(roomName, author, text) {
    const cleanKey = roomName.trim().toLowerCase();

    if (!this.rooms.has(cleanKey)) {
      return null;
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      author,
      text,
      timestamp: new Date().toISOString(),
    };

    this.messages.get(cleanKey).push(newMessage);

    return newMessage;
  }

  registerClient(ws) {
    this.activeClients.set(ws, {
      username: 'Anonymous',
      currentRoom: DEFAULT_ROOM,
    });
  }

  unregisterClient(ws) {
    this.activeClients.delete(ws);
  }

  getClientMeta(ws) {
    return this.activeClients.get(ws);
  }

  getAllClients() {
    return this.activeClients;
  }
}

module.exports = new ChatState();
