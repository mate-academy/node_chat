import { Room } from '../models/room.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { Message } from '../models/messsage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const roomsService = {
  async getById(roomId) {
    return await Room.findOne({ where: { id: roomId } });
  },

  async create(userName, roomName, limit) {
    const created = await Room.create(
      { admin: userName, name: roomName, limit, users: [userName] },
      { returning: true },
    );

    if (!created) return false;

    return created;
  },

  async join(roomId, userName) {
    const foundRoom = await this.getById(roomId);
    if (!foundRoom) return undefined;

    const currentUsers = foundRoom.users;
    const roomLimit = foundRoom.limit;

    if (Number(currentUsers.length) >= Number(roomLimit)) return false;

    const updatedUsers = currentUsers.includes(userName)
      ? currentUsers
      : [...currentUsers, userName];

    await foundRoom.update({ users: updatedUsers });
    return foundRoom;
  },

  async getMessages(roomId) {
    const allMessages = await Message.findAll({ where: { roomId } });

    return allMessages.map((message) => message.dataValues);
  },

  async addMessage(roomId, user, content) {
    const messageDate = new Date().toISOString();

    const newMessage = await Message.create(
      { text: content, name: user, roomId: roomId, date: messageDate },
      { returning: true },
    );

    return newMessage.dataValues;
  },
};
