const { generateId } = require('../utils/ids');

const rooms = new Map();

class RoomModel {
  static create(name, owner) {
    const id = generateId(6);
    const newRoom = {
      id,
      name,
      owner,
      users: new Set(),
      messages: [],
      createdAt: new Date().toISOString(),
    };

    rooms.set(id, newRoom);

    return newRoom;
  }

  static findById(id) {
    return rooms.get(id);
  }

  static getAll() {
    return Array.from(rooms.values()).map((room) => ({
      id: room.id,
      name: room.name,
      owner: room.owner,
      createdAt: room.createdAt,
    }));
  }

  static rename(id, newName) {
    const room = rooms.get(id);

    if (!room) {
      return null;
    }

    room.name = newName;

    return room;
  }

  static delete(id) {
    return rooms.delete(id);
  }

  static addMessage(roomId, message) {
    const room = rooms.get(roomId);

    if (!room) {
      return;
    }

    room.messages.push(message);

    return message;
  }

  static getMessages(roomId) {
    const room = rooms.get(roomId);

    return room ? room.messages : [];
  }
}

module.exports = RoomModel;
