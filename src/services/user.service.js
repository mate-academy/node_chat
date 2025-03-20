import { User } from '../models/index.js';
import { ApiError } from '../exceptions/api.error.js';

const createNewUser = async (username) => {
  if (!username) {
    throw ApiError.badRequest('Username is required to create new user');
  }

  const userAlreadyExist = await findByUserName(username);

  if (userAlreadyExist) {
    throw ApiError.conflict('This username is already in use');
  }

  return User.create({ username });
};

const normalizeUser = ({ id, username }) => {
  return { id, username };
};

const findByUserName = async (username) => {
  if (!username) {
    throw ApiError.badRequest('Username is required to find user');
  }

  const user = await User.findOne({
    where: {
      username,
    },
  });

  if (!user) {
    throw ApiError.notFound('User with such username is not found');
  }

  return user;
};

const findById = async (userId) => {
  if (!userId) {
    throw ApiError.badRequest('User ID is required to find user');
  }

  const user = await User.findByPk(+userId);

  if (!user) {
    throw ApiError.notFound(`User with such ID (${userId}) is not found`);
  }

  return user;
};

const deleteUser = async (userId) => {
  if (!userId) {
    throw ApiError.badRequest('User ID is required to delete user');
  }

  const targetUser = await findById(+userId);

  await targetUser.destroy();

  return true;
};

export const userService = {
  createNewUser,
  normalizeUser,
  findByUserName,
  findById,
  deleteUser,
};
