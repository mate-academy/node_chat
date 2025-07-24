import { userService } from '../services/user.service.js';

const newUser = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.sendStatus(401);
  }

  await userService.createUser(name);

  res.sendStatus(201);
};

export const userController = {
  newUser,
};
