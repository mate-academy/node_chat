import { userService } from '../services/user.service.js';

const create = async (req, res) => {
  const { username } = req.body;

  await userService.create(username);

  res.status(201).send({ message: 'User created successfully' });
};

export const userController = {
  create,
};
