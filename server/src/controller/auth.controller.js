import { userService } from '../services/auth.service.js';

const login = (req, res) => {
  const { userData } = req.body;

  const user = userService.login(userData);

  res.status(200).send(user);
};

export const authController = {
  login,
};
