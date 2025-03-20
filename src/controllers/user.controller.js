import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/api.error.js';

const createNewUser = async (req, res) => {
  const { userName } = req.body;

  const newUser = await userService.createNewUser(userName);

  const normalizedUser = userService.normalizeUser(newUser);

  return res.status(201).send(normalizedUser);
};

const deleteUser = async (req, res) => {
  const { userId } = req.body;

  const result = await userService.deleteUser(+userId);

  if (!result) {
    throw ApiError.badRequest('Unsuccessful user deletion');
  }

  return res.sendStatus(204);
};

export const userController = {
  createNewUser,
  deleteUser,
};
