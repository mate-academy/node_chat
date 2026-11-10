import { Room } from '../models/room.js';

const getAll = async () => {
  return Room.findAll({
    order: [
      ['createdAt', 'ASC'],
      ['id', 'ASC'],
    ],
  });
};

const getById = async (id) => {
  return Room.findByPk(id);
};

const createRoom = async ({ name }) => {
  return Room.create({ name });
};

const update = async ({ id, name }) => {
  const room = await Room.findByPk(id);

  if (!room) {
    return null;
  }

  await room.update({ name });

  return room;
};

const deleteById = async (id) => {
  const room = await Room.findByPk(id);

  if (!room) {
    return null;
  }

  await room.destroy();

  return room;
};

export const roomsService = {
  getAll,
  getById,
  createRoom,
  update,
  deleteById,
};
