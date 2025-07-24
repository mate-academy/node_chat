import { User } from '../models/User.model.js';

const createUser = async (name) => {
  return User.create({ name });
};

export const userService = {
  createUser,
};
