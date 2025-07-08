const usersRepository = require('../entity/users.repository');
const bcrypt = require('bcrypt');
const { normalize } = require('../service/validation.service');
const jwt = require('../utils/jwt');
const tokenRepository = require('../entity/refreshToken.repository');
const ApiError = require('../exceptions/ApiError');
const { validationResult } = require('express-validator');

async function register(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(ApiError.BadRequest('Validation error', errors.array()));
  }

  const { username: name, password } = req.body;

  const existingUser = await usersRepository.getUserByName(name);

  if (existingUser) {
    return next(ApiError.Conflict('User with this name already exists'));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await usersRepository.createUser(name, hashedPassword);

  res.status(201).json(normalize(user));
}

async function login(req, res, next) {
  const { username: name, password } = req.body;

  const user = await usersRepository.getUserByName(name);

  if (!user) {
    return next(ApiError.Unauthorized('Invalid credentials'));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return next(ApiError.Unauthorized('Invalid credentials'));
  }

  const normalizedUser = normalize(user);
  const accessToken = jwt.generateAccessToken(normalizedUser);
  const refreshToken = jwt.generateRefreshToken(normalizedUser);

  await tokenRepository.saveOrUpdateToken(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({
    user: normalizedUser,
    accessToken,
  });
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      const userData = jwt.validateRefreshToken(refreshToken);

      if (userData) {
        await tokenRepository.deleteToken(userData.id);
      }
    }
    res.clearCookie('refreshToken');

    return res.status(200).json({ message: 'Logout successful' });
  } catch (e) {
    next(e);
  }
}

async function refresh(req, res, next) {
  const { refreshToken: incomingRefreshToken } = req.cookies;

  if (!incomingRefreshToken) {
    return next(ApiError.Unauthorized('Refresh token is missing.'));
  }

  const userData = jwt.validateRefreshToken(incomingRefreshToken);

  if (!userData) {
    return next(ApiError.Unauthorized('Invalid refresh token.'));
  }

  const storedToken = await tokenRepository.findUnique(userData.id);

  if (!storedToken || storedToken.token !== incomingRefreshToken) {
    return next(ApiError.Unauthorized('Mismatched token.'));
  }

  const user = await usersRepository.getUserById(userData.id);

  if (!user) {
    return next(ApiError.Unauthorized('User not found.'));
  }

  const normalizedUser = normalize(user);
  const newAccessToken = jwt.generateAccessToken(normalizedUser);

  res.json({
    user: normalizedUser,
    accessToken: newAccessToken,
  });
}

module.exports = {
  register,
  login,
  logout,
  refresh,
};
