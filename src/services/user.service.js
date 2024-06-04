import { User } from '../models/User.js';

const getByName = (username) => {
  return User.findOne({ where: { username } });
};

const create = (username) => {
  return User.create({ username });
};

export default {
  getByName,
  create,
};
