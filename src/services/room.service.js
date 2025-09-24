import { Room } from '../models/Room.js';

const getAll = async () => {
  const result = await Room.findAll();
  return result;
};

const add = async (room) => {
  try {
    const newRoom = await Room.create(room);
    return newRoom;
  } catch (error) {
    throw new Error('Failed to add room: ' + error.message);
  }
};

const rename = async (name, id) => {
  const [updatedCount] = await Room.update({ name }, { where: { id } });
  if (updatedCount > 0) {
    const updatedRoom = await Room.findByPk(id);
    return updatedRoom;
  }
  return null;
};

const deleteRoom = async (id) => {
  const deletedCount = await Room.destroy({
    where: { id },
  });
  return deletedCount > 0;
};

export const roomService = {
  getAll,
  add,
  deleteRoom,
  rename,
};
