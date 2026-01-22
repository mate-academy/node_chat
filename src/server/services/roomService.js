'use strict';

const RoomModel = require('../models/roomModel');

const roomService = {
  createRoom({ name, owner }) {
    if (!name || !owner) {
      throw new Error('name та owner обовʼязкові');
    }

    return RoomModel.create(name, owner);
  },

  getRooms() {
    return RoomModel.getAll();
  },

  joinRoom({ roomId, username }) {
    if (!roomId || !username) {
      throw new Error('roomId та username обовʼязкові');
    }

    const room = RoomModel.findById(roomId);

    if (!room) {
      throw new Error('Кімната не знайдена');
    }

    return room;
  },

  renameRoom({ roomId, newName }) {
    if (!roomId || !newName) {
      throw new Error('roomId та нова назва обовʼязкові');
    }

    const room = RoomModel.rename(roomId, newName);

    if (!room) {
      throw new Error('Кімната не знайдена');
    }

    return room;
  },

  deleteRoom({ roomId }) {
    if (!roomId) {
      throw new Error('roomId обовʼязковий');
    }

    const deleted = RoomModel.delete(roomId);

    if (!deleted) {
      throw new Error('Кімната не знайдена');
    }
  },

  addMessage({ roomId, author, text }) {
    if (!roomId || !author || !text) {
      throw new Error('Некоректні дані повідомлення');
    }

    const message = {
      author,
      text,
      time: new Date().toISOString(),
    };

    RoomModel.addMessage(roomId, message);

    return message;
  },

  getHistory(roomId) {
    return RoomModel.getMessages(roomId);
  },
};

module.exports = roomService;
