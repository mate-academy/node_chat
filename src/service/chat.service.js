/* eslint-disable no-return-await */
import { ApiError } from '../exceptions/api.error.js';
import { Messages } from '../modules/Messages.js';
import { Room } from '../modules/Room.js';
import { Token } from '../modules/Token.js';
import { User } from '../modules/User.js';
import { Console } from '../utils/Console.js';

async function createRoom(name) {
  const exitRoom = await Room.findOne({ where: { name } });

  if (exitRoom) {
    throw ApiError.badRequest('Room already exists');
  }

  const room = await Room.create({ name });

  Console.log(`Room create ${room}`);
}

async function getId(name) {
  const room = await Room.findOne({ where: { name } });

  if (!room) {
    throw ApiError.badRequest('Room not found');
  }

  return room.id;
}

async function getUser(refreshToken) {
  const tokenData = await Token.findOne({ where: { refreshToken } });

  if (!tokenData) {
    throw ApiError.badRequest('Invalid refresh token');
  }

  const user = await User.findOne({ where: { id: tokenData.userId } });

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  return user.userName;
}

async function sendMessages(text, roomId, author) {
  return await Messages.create({ text, roomId, author });
}

async function getAll(roomId) {
  const allMessages = Messages.findAll({
    where: { roomId },
    order: [['createdAt', 'ASC']],
  });

  if (!allMessages) {
    return ['Messages empty'];
  }

  return allMessages;
}

async function getAllRoom() {
  const allRooms = await Room.findAll();
  const roomData = allRooms.map((room) => ({
    id: room.dataValues.id,
    name: room.dataValues.name,
  }));

  return roomData;
}

async function removeRoom(id) {
  await Room.destroy({ where: { id } });
}

export const chatService = {
  createRoom,
  getId,
  sendMessages,
  getAll,
  getAllRoom,
  removeRoom,
  getUser,
};
