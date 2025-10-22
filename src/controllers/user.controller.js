import { User } from '../models/user.model.js';
import { userService } from '../services/user.service.js';

const create = async (req, res) => {
  const { name } = req.body;
  const isNameExist = await User.findOne({ where: { name } });

  if (!name) {
    return res.status(400).json({ message: 'User is required' });
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
