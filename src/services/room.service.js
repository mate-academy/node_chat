import { Room } from '../models/index.js';

const createRoom = async (name, ownerId) => {
  const room = await Room.create({ name, ownerId });

  return room;
};

const removeRoom = async (roomId) => {
  await Room.destroy({ where: { id: roomId } });
};

const editRoom = async (id, name) => {
  const room = await Room.findByPk(id);

  const updatedRoom = await room.update({ name });
  return updatedRoom;
};

const findRoomByName = async (name) => {
  const room = await Room.findOne({ where: { name } });

  return room;
};

const findRoomById = async (id) => {
  const room = await Room.findOne({ where: { id } });

  return room;
};

const getAllRooms = async () => {
  const rooms = await Room.findAll();

  return rooms;
};

export const roomService = {
  createRoom,
  removeRoom,
  findRoomByName,
  findRoomById,
  getAllRooms,
  editRoom,
};
