import { ApiError } from '../exeptions/api.error.js';
import { userService } from '../services/user.service.js';

const login = async (req, res) => {
  const { userName } = req.body;

  try {
    const activeUser = await userService.getUser(userName);

    res.cookie('activeUser', activeUser, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // localStorage.setItem('activeUser', JSON.stringify(activeUser));

    res.send(activeUser);
  } catch (e) {
    throw ApiError.badRequest(e);
  }
};

const getUser = async (req, res) => {
  const activeUserCookie = req.cookies.activeUser;
  let activeUser;

  try {
    activeUser = JSON.parse(activeUserCookie);
  } catch (err) {
    throw ApiError.unauthorized(err);
  }

  const user = await userService.getUser(activeUser.name);

  res.send(user);
};

export const authController = {
  login,
  getUser,
};
