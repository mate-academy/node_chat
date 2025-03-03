import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const { username } = req.headers;

    if (!username) {
      throw ApiError.badRequest('Username is required');
    }

    const user = await User.findOne({ where: { name: username } });

    if (!user) {
      throw ApiError.notFound({
        message: `User ${username} is not found`,
      });
    }

    req.user = { id: user.id, name: user.name };

    next();
  } catch (error) {
    next(error);
  }
};
