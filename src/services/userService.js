import { ApiError } from '../exceptions/ApiError.js';
import { User } from '../models/index.js';

async function getOne(id) {
  return User.findByPk(id);
}

async function getByName(name) {
  return User.findOne({
    where: {
      name: name,
    },
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

  return User.create({
    name,
  });
}

export const userService = {
  getOne,
  getByName,
  createOrLogIn,
};
