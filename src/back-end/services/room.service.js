import { Room } from '../models/Room.model.js';

const createNewRoom = async (title) => {
  return Room.create({ title });
};

export const roomService = {
  createNewRoom,
};
