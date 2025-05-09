import { ApiError } from '../exeptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import { userController } from './user.controller.js';

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    const userData = await jwtService.verifyRefresh(refreshToken);
    const token = await tokenService.getByToken(refreshToken);

    if (!userData || !token) {
      throw ApiError.unauthorized();
    }

    const user = await userService.findByUserName(userData.username);

    userController.generateToken(res, user);
  } catch (error) {
    next(error);
  }
};

export const refreshController = {
  refresh,
};
