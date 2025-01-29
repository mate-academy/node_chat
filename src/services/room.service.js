import { Room } from '../models/room.model.js';

const findById = (id) => {
  return Room.findOne({ where: { id } });
};

const findByName = (name) => {
  return Room.findOne({ where: { name } });
};

const createRoom = async (name) => {
  const checkRoom = await findByName(name);

  if (checkRoom) {
    throw new Error('Room already exists');
  }

  const newRoom = await Room.create({ name });

  return newRoom;
};

const updateRoom = async (id, name) => {
  const updatedRoom = await roomService.findById(id);

  if (!updatedRoom) {
    throw new Error('Room not found');
  }
  updatedRoom.name = name;
  await updatedRoom.save();

  return updatedRoom;
};

export const roomService = {
  findById,
  createRoom,
  updateRoom,
};
