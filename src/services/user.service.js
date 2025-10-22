import { User } from '../models/user.model.js';

const createUser = async (name) => {
  return User.create({ name });
};

export const userService = {
  createUser,
};
