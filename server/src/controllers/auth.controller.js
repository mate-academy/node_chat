import { ApiError } from '../exeptions/api.error.js';
import { userService } from '../services/user.service.js';

export const login = async (req, res, next) => {
  const { username } = req.body;

  if (!username || username.trim() === '') {
    return next(ApiError.badRequest('Username is required'));
  }

  const user = await userService.loginUser(username.trim());

  res.status(200).json(user);
};

export const authContorller = {
  login,
};
