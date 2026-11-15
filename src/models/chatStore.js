import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

const clients = [];
let messages = [];
const chatRooms = [{ name: 'General', id: '1', userName: 'System' }];
const events = new EventEmitter();

export const chatStore = {
  getRooms() {
    return chatRooms;
  },

  getRoom(id) {
    return chatRooms.find((room) => room.id.toString() === id.toString());
  },

  registerUser(userName) {
    if (clients.some((client) => client.userName === userName)) {
      return null;
    }

    const user = { userName, id: randomUUID() };

    clients.push(user);

    return user;
  },

  createRoom(name, userName) {
    const room = { userName, name, id: randomUUID() };

    chatRooms.push(room);

    return room;
  },

  renameRoom(id, name, userName) {
    const room = chatRooms.find((item) => item.id.toString() === id.toString());

    if (!room) {
      return { status: 'not-found' };
    }

    if (room.userName !== userName) {
      return { status: 'forbidden' };
    }

    room.name = name.trim();

    return { status: 'renamed', room };
  },

  deleteRoom(id, userName) {
    const roomIndex = chatRooms.findIndex(
      (room) => room.id.toString() === id.toString(),
    );

    if (roomIndex === -1) {
      return { status: 'not-found' };
    }

    if (chatRooms[roomIndex].userName !== userName) {
      return { status: 'forbidden' };
    }

    chatRooms.splice(roomIndex, 1);

    messages = messages.filter(
      (message) => message.roomId.toString() !== id.toString(),
    );
    events.emit('room-deleted', id);

    return { status: 'deleted' };
  },

  addMessage(text, roomId, author) {
    const message = {
      id: randomUUID(),
      text,
      roomId,
      author,
      time: Date.now(),
    };

    messages.push(message);
    events.emit('message', message);

    return message;
  },

  getMessages(roomId) {
    return messages.filter(
      (message) => message.roomId.toString() === roomId.toString(),
    );
  },

  on(eventName, handler) {
    events.on(eventName, handler);
  },

  off(eventName, handler) {
    events.off(eventName, handler);
  },
};
