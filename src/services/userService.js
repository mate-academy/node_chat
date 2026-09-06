import { User } from '../modules/User.js';

async function createUser(username) {
  return User.create({ username });
}

async function getUserById(userId) {
  return User.findByPk(userId);
}

export const userService = {
  createUser,
  getUserById,
};
