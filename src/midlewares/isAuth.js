import { userService } from '../services/user.service.js';

export const isAuth = async (req, res, next) => {
  const userName = req.headers['x-username'];

  if (!userName) {
    return res.status(401).json({ error: 'Користувач не авторизований' });
  }

  const trueUser = await userService.getUserByName(userName);

  if (!trueUser) {
    return res.status(401).json({ error: 'Користувач не авторизований' });
  }
  req.user = trueUser;
  next();
};
