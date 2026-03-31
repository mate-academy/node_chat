import { usersRepository } from '../entity/users.repository.js';
import { ApiError } from '../exeptions/api.error.js';
import { validateUsername } from '../../utils/validators.js';

const createUser = async (req, res) => {
  const { username } = req.body;

  const error = validateUsername(username);

  if (error) {
    throw ApiError.badRequest(error);
  }

  const user = await usersRepository.getByUsername(username);

  if (user) {
    res.json(user);

    return;
  }

  const createdUser = await usersRepository.create(username);

  res.json(createdUser);
};

export const usersController = {
  createUser,
};
