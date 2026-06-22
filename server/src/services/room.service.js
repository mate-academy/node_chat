import { ApiError } from '../exeptions/api.error.js';
import { Room } from '../models/index.js';

const getAllRooms = async () => {
  return Room.findAll();
};

const createRoom = async (name, userId) => {
  const newRoom = await Room.create({ name });

  await newRoom.addUser(userId);

  return newRoom;
};

const renameRoom = async (roomId, newName) => {
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  room.name = newName;
  await room.save();

  return room;
};

const deleteRoom = async (roomId) => {
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  await room.destroy();

  return {
    success: true,
    message: 'Room successfully deleted',
    roomId: Number(roomId),
  };
};

const joinRoom = async (roomId, userId) => {
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  await room.addUser(userId);

  return {
    success: true,
    message: 'User successfully joined the room',
    roomId: Number(roomId),
    userId: Number(userId),
  };
};

export const roomService = {
  getAllRooms,
  createRoom,
  renameRoom,
  deleteRoom,
  joinRoom,
};
