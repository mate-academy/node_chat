import { Room } from '../models/Room.js';

const getByName = (name) => {
  return Room.findOne({ where: { name } });
};

const create = (name) => {
  return Room.create({ name });
};

export default {
  create,
  getByName,
};
