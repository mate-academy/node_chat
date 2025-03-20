/* eslint-disable function-paren-newline, comma-dangle */

import { Room, User } from '../models/index.js';
import { messageService } from './message.service.js';
import { ApiError } from '../exceptions/api.error.js';

const findRoomByName = async (roomName) => {
  return Room.findOne({
    where: {
      roomName,
    },
  });
};

const findRoomById = async (roomId) => {
  if (!roomId) {
    throw ApiError.badRequest('Room ID is required');
  }

  const room = await Room.findByPk(+roomId);

  if (!room) {
    throw ApiError.notFound(`Room with ID ${roomId} not found`);
  }

  return room;
};

const createNewRoom = async (roomName) => {
  if (!roomName) {
    throw ApiError.badRequest('Room name is required');
  }

  const existingRoom = await findRoomByName(roomName);

  if (existingRoom) {
    throw ApiError.conflict('Room with this name already exists');
  }

  return Room.create({ roomName });
};

const getAllRooms = async () => {
  const allRooms = await Room.findAll();

  return allRooms.map((room) => normalizeRoom(room));
};

const normalizeRoom = ({ id, roomName }) => {
  return {
    roomId: id,
    roomName,
  };
};

const getAllRoomMessages = async (roomId) => {
  if (!roomId) {
    throw ApiError.badRequest('Room ID is required');
  }

  const targetRoom = await findRoomById(+roomId);

  const messages = await targetRoom.getMessages({
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['username'],
      },
    ],
  });

  return messages.map((message) =>
    messageService.normalizeMessage(message.toJSON()),
  );
};

const changeRoomName = async (roomId, newRoomName) => {
  if (!roomId) {
    throw ApiError.badRequest('Room ID is required');
  }

  if (!newRoomName) {
    throw ApiError.badRequest('New room name is required');
  }

  const targetRoom = await findRoomById(+roomId);

  targetRoom.roomName = newRoomName;
  await targetRoom.save();

  return targetRoom;
};

const deleteRoom = async (roomId) => {
  if (!roomId) {
    throw ApiError.badRequest('Room ID is required to delete room');
  }

  const targetRoom = await findRoomById(+roomId);

  const result = await targetRoom.destroy();

  if (!result) {
    throw ApiError.badRequest('Unsuccessful room deletion');
  }

  return true;
};

export const roomService = {
  findRoomByName,
  findRoomById,
  createNewRoom,
  getAllRooms,
  normalizeRoom,
  getAllRoomMessages,
  changeRoomName,
  deleteRoom,
};
