import { ApiError } from '../exeptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';

const createUser = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username) {
      throw ApiError.badRequest('Enter the username');
    }

    await userService.createUser(username);

    const user = await userService.findByUserName(username);

    await generateToken(res, user);
  } catch (error) {
    next(error);
  }
};

const generateToken = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({ user: normalizedUser, accessToken });
};

export const userController = {
  createUser,
  generateToken,
};
