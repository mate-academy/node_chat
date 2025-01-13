import { ApiError } from '../exceptions/ApiError.js';
import { User } from '../models/index.model.js';

async function getOne(id) {
  const user = await User.findByPk(id);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  return user;
}

async function getByName(name) {
  return User.findOne({
    where: { name },
  });
}

async function createOrLogIn(name) {
  if (!name.trim()) {
    throw ApiError.BadRequest('Validation error', {
      name: 'Name is empty',
    });
  }

  const user = await getByName(name);

  if (user) {
    return user;
  }

  const newUser = await User.create({
    name,
  });

  return newUser;
}

export const userService = {
  getOne,
  getByName,
  createOrLogIn,
};
