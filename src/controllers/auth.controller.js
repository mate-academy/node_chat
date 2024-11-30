import { ApiError } from '../exceptions/api.error.js';
import { User } from '../modules/User.js';
import { userService } from '../service/user.service.js';
import bcrypt from 'bcrypt';
import { Console } from '../utils/Console.js';
import { jwtService } from '../service/jwt.service.js';
import { tokenService } from '../service/token.service.js';

const register = async (req, res) => {
  const { userName, email, password } = req.body;

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Email, password, are not validate', errors);
  }

  const hashPass = await bcrypt.hash(password, 10);

  await userService.register(userName, email, hashPass);

  res.status(201).send({
    message:
      'User registered successfully, check your email for activate account',
  });
};

const login = async (req, res) => {
  const { userName, password } = req.body;

  const user = await User.findOne({ where: { userName } });

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  generateToken(res, user);
  Console.log(`${user.userName} login`);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  // console.log('hello', req.cookies);

  const userData = await jwtService.verifyRefresh(refreshToken);
  // const token = await jwtService.signRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorize();
  }

  const email = userData.email;

  const user = await User.findOne({ where: { email } });

  generateToken(res, user);
};

const generateToken = async (res, user) => {
  const normalizeUser = userService.normalize(user);

  const accessToken = await jwtService.sign(normalizeUser);
  const refreshToken = await jwtService.signRefresh(normalizeUser);

  await tokenService.save(normalizeUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 3600 * 10 * 10 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizeUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorize();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

export const authController = {
  register,
  login,
  refresh,
  logout,
};
