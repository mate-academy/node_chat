import { userService } from '../services/userService.js';

const saveUser = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json('Enter username');
  }

  const user = await userService.createUser(username);

  return res.status(201).json(user);
};

const getUser = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json('userId required');
  }

  const user = await userService.getUserById(userId);

  return res.json(user);
};

export const userController = {
  saveUser,
  getUser,
};
