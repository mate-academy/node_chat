import { Room } from '../models/Room.js';
import { v4 as uuidv4 } from 'uuid';

const get = () => {
  return Room.findAll();
};

const create = (roomName, authorName) => {
  const id = uuidv4();
  return Room.create({ id, roomName, authorName });
};

const findById = (id) => {
  return Room.findByPk(id);
};

const findByName = (name) => {
  return Room.findOne({ where: { roomName: name } });
};

const update = async (id, roomName) => {
  const [_, updatedRoom] = await Room.update(
    { roomName },
    { where: { id }, returning: true, plain: true },
  );

  return updatedRoom;
};

const remove = (id) => {
  return Room.destroy({ where: { id } });
};

export const roomService = {
  get,
  create,
  findById,
  findByName,
  update,
  remove,
};
