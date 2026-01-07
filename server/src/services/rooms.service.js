import { Room } from '../models/room.model.js';

const getAll = async () => {
  const rooms = await Room.findAll();

  return rooms;
};

const create = async ({ name }) => {
  const newRoom = await Room.create({ name });

  return newRoom;
};

const findById = async (id) => {
  const room = await Room.findByPk(id);

  return room;
};

const edit = async (id, name) => {
  const room = await findById(id);
  if (!room) return null;
  room.name = name;
  await room.save();
  return room;
};

const remove = async (id) => {
  const room = await findById(id);
  if (!room) return null;
  await room.destroy();
  return room;
};

export const roomService = {
  getAll,
  create,
  findById,
  edit,
  remove,
};
