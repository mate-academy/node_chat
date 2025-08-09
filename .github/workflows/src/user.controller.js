import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';

const create = async (req, res) => {
  const { name } = req.body;
  const isNameExist = await User.findOne({ where: { name } });

  if (!name) {
    return res.sendStatus(404);
  }

  if (isNameExist) {
    return res.status(409).json({ message: 'User already exists' });
  }

  await userService.createUser(name);

  return res.status(201).json({ message: 'User was created!' });
};

export const userController = {
  create,
};
