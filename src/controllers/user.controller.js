import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';

const create = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const isNameExist = await User.findOne({ where: { name } });

    if (isNameExist) {
      return res.status(409).json({ message: 'User already exists' });
    }

    await userService.createUser(name);

    return res.status(201).json({ message: 'User was created!' });
  } catch {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const userController = {
  create,
};
