'use strict';

const { randomUUID } = require('node:crypto');

/** In-memory store (troque por DB em produção). */
class Store {
  constructor() {
    /** @type {Map<string, {id:string,name:string,createdAt:string}>} */
    this.rooms = new Map();
    // eslint-disable-next-line max-len
    /** @type {Map<string, Array<{id:string,author:string,at:string,text:string}>>} */
    this.messages = new Map();
    this.ensureDefaultRoom();
  }

  ensureDefaultRoom() {
    if (this.rooms.size === 0) {
      const id = randomUUID();
      const now = new Date().toISOString();

      this.rooms.set(id, { id, name: 'general', createdAt: now });
      this.messages.set(id, []);
    }
  }

  listRooms() {
    return Array.from(this.rooms.values()).sort(
      (a, b) => a.name.localeCompare(b.name),
      // eslint-disable-next-line function-paren-newline
    );
  }

  createRoom(name) {
    const trimmed = String(name || '').trim();

    if (!trimmed) {
      throw new Error('Room name is required');
    }

    const id = randomUUID();
    const room = { id, name: trimmed, createdAt: new Date().toISOString() };

    this.rooms.set(id, room);
    this.messages.set(id, []);

    return room;
  }

  renameRoom(id, name) {
    const room = this.rooms.get(id);

    if (!room) {
      throw new Error('Room not found');
    }

    const trimmed = String(name || '').trim();

    if (!trimmed) {
      throw new Error('Room name is required');
    }
    room.name = trimmed;

    return room;
  }

  deleteRoom(id) {
    const existed = this.rooms.delete(id);

    this.messages.delete(id);

    if (!existed) {
      throw new Error('Room not found');
    }
  }

  getRoom(id) {
    return this.rooms.get(id) || null;
  }

  listMessages(roomId) {
    const msg = this.messages.get(roomId);

    if (!msg) {
      throw new Error('Room not found');
    }

    return msg;
  }

  appendMessage(roomId, author, text) {
    const msgArr = this.messages.get(roomId);

    if (!msgArr) {
      throw new Error('Room not found');
    }

    const message = {
      id: randomUUID(),
      author,
      at: new Date().toISOString(),
      text: String(text || '').slice(0, 1000),
    };

    msgArr.push(message);

    return message;
  }
}

const store = new Store();

module.exports = { store };
