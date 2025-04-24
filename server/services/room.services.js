// @ts-nocheck
import { ApiError } from '../exeptions/api.error.js';
import { Rooms } from '../models/room.js';

export const createNewRoom = async (name) => {
  return await Rooms.create({
    name,
  });
};

export const deleteRoomById = async (id) => {
  const room = await Rooms.findByPk(id);
  return await room.destroy();
};

export const getAll = () => Rooms.findAll();

export const getRoomById = (id) => Rooms.findByPk(id);

export const getRoomByName = (name) => Rooms.findOne({ where: { name: name } });
