import { Room, Message } from '../model/model.js';

const getAllRooms = async () => {
  return Room.findAll();
};

const getRoom = async (id) => {
  return Room.findByPk(id, { include: [Message] });
};

const createRoom = async (name) => {
  return Room.create({ name });
};

const updateRoom = async (id, name) => {
  const room = await Room.findByPk(id);

  if (!room) {
    return null;
  }
  room.name = name;
  await room.save();

  return room;
};

const deleteRoom = async (id) => {
  const room = await Room.findByPk(id);

  if (!room) {
    return;
  }
  await room.destroy();
};

export const roomService = {
  getAllRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
};
