'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

class ChatStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.memory = this.initialState();
    this.persistent = Boolean(filePath);

    if (this.persistent) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      if (!fs.existsSync(filePath)) {
        this.save(this.memory);
      }
    }
  }

  initialState() {
    return {
      users: [],
      rooms: [{ id: randomUUID(), name: 'General', messages: [] }],
    };
  }

  all() {
    if (!this.persistent) {
      return this.memory;
    }

    try {
      const state = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));

      if (!Array.isArray(state.rooms) || !state.rooms.length) {
        return this.initialState();
      }

      if (!Array.isArray(state.users)) {
        state.users = [];
      }

      return state;
    } catch (error) {
      return this.initialState();
    }
  }

  save(state) {
    if (!this.persistent) {
      this.memory = state;

      return;
    }

    const temporary = `${this.filePath}.tmp`;

    fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`);
    fs.renameSync(temporary, this.filePath);
  }

  rooms() {
    return this.all().rooms;
  }

  findRoom(id) {
    return this.rooms().find((room) => room.id === id);
  }

  registerUser(username) {
    const state = this.all();
    const existing = state.users.find(
      (item) => item.username.toLowerCase() === username.toLowerCase(),
    );

    if (existing) {
      return existing;
    }

    const user = {
      id: randomUUID(),
      username,
      joinedAt: new Date().toISOString(),
    };

    state.users.push(user);
    this.save(state);

    return user;
  }

  createRoom(name) {
    const state = this.all();
    const room = { id: randomUUID(), name, messages: [] };

    state.rooms.push(room);
    this.save(state);

    return room;
  }

  renameRoom(id, name) {
    const state = this.all();
    const room = state.rooms.find((item) => item.id === id);

    if (!room) {
      return null;
    }

    room.name = name;
    this.save(state);

    return room;
  }

  deleteRoom(id) {
    const state = this.all();
    const previousLength = state.rooms.length;

    state.rooms = state.rooms.filter((room) => room.id !== id);

    if (state.rooms.length === previousLength) {
      return false;
    }

    this.save(state);

    return true;
  }

  addMessage(roomId, author, text) {
    const state = this.all();
    const room = state.rooms.find((item) => item.id === roomId);

    if (!room) {
      return null;
    }

    const message = {
      id: randomUUID(),
      author,
      time: new Date().toISOString(),
      text,
    };

    room.messages.push(message);
    this.save(state);

    return message;
  }
}

module.exports = { ChatStore };
