import { User } from '../models/index.js';

async function findUserByEmail(email) {
  const user = await User.findOne({ where: { email } });

  return user;
}

async function findUserByLogin(login) {
  const user = await User.findOne({ where: { login } });

  return user;
}

function normalizeUser({ id, login, email }) {
  return { id, login, email };
}

async function register(login, email, password) {
  const newUser = await User.create({
    login,
    email,
    password,
  });

  return newUser;
}

export const userService = {
  findUserByEmail,
  normalizeUser,
  register,
  findUserByLogin,
};
