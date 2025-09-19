import { userService } from '../services/user.service.js';

export const isNotAuth = async (req, res, next) => {
  const userName = req.headers['x-username'];

  if (!userName) {
    return next();
  }

  const trueUser = await userService.getUserByName(userName);

  if (trueUser) {
    return res.status(401).json({ error: 'Користувач авторизований' });
  }

  next();
};
