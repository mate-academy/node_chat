import { Room } from '../models/Room.model.js';

const findAllRooms = async () => {
  return Room.findAll();
};

const findRoomById = async (roomId) => {
  return Room.findByPk(+roomId);
};

const findRoomByName = async (name) => {
  return Room.findOne({
    where: { name },
  });
};

const createRoom = async (name) => {
  return Room.create({ name });
};

const updateRoomName = async (room, newName) => {
  room.name = newName;

  return room.save();
};

const deleteRoom = async (roomId) => {
  return Room.destroy({ where: { id: roomId } });
};

export const roomService = {
  findAllRooms,
  findRoomById,
  findRoomByName,
  createRoom,
  updateRoomName,
  deleteRoom,
};
