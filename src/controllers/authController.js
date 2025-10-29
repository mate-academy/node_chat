import { ApiError } from '../exceptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import { validation } from '../utils/validation.js';
import bcrypt from 'bcrypt';

const register = async (req, res) => {
  const { login, email, password } = req.body;

  const errors = {
    email: validation.validateEmail(email),
    password: validation.validatePassword(password),
    name: validation.validateName(login),
  };

  const filteredErrors = Object.fromEntries(
    Object.entries(errors).filter(([key, value]) => value),
  );

  if (Object.keys(filteredErrors).length > 0) {
    throw ApiError.badRequest(filteredErrors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await userService.findUserByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest({
      email: 'User already exists',
    });
  }

  const loginTaken = await userService.findUserByLogin(login);

  if (loginTaken) {
    throw ApiError.badRequest({
      login: 'This login is already taken',
    });
  }

  const user = await userService.register(login, email, hashedPassword);
  const normalizedUser = userService.normalizeUser(user);

  res
    .status(201)
    .json({ message: 'User created successfully', user: normalizedUser });
};

const logIn = async (req, res) => {
  const { login, password } = req.body;

  const user = await userService.findUserByLogin(login);

  if (!user) {
    throw ApiError.notFound({
      message: 'User not found',
    });
  }

  const isPassValid = await bcrypt.compare(password, user.password);

  if (!isPassValid) {
    throw ApiError.badRequest({
      message: 'Wrong password',
    });
  }

  const normalizedUser = userService.normalizeUser(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.saveToken(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    accessToken,
    user: normalizedUser,
  });
};

export const authController = {
  register,
  logIn,
};
