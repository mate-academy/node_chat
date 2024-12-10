const bcrypt = require('bcrypt');
const uuid = require('uuid');

require('dotenv').config();

const emailService = require('../services/email.service');
const userService = require('../services/user.service');
const jwtService = require('../services/jwt.service');
const tokenService = require('../services/token.service');
const { ApiError } = require('../utils/api.error');
const { User } = require('../models/user.model');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const activationToken = uuid.v4();

  const { refreshToken } = req.cookies;
  const userData = await jwtService.validateRefreshToken(refreshToken);

  if (userData) {
    throw ApiError.badRequest('Only for not authorized');
  }

  if (!name || !email || !password) {
    throw ApiError.badRequest('Not all credentials are provided!');
  }

  const user = await userService.getByEmail(email);

  if (user) {
    throw ApiError.badRequest('The user with this email already exists!');
  }

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.HASH_ROUNDS, 10),
  );
  const newUser = { name, email, password: hashedPassword };

  emailService.sendVerificationEmail(email, activationToken);
  userService.create({ ...newUser, activationToken });

  res.sendStatus(201);
};

const sendAuthentication = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const refreshToken = jwtService.generateRefreshToken(normalizedUser);
  const accessToken = jwtService.generateAccessToken(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  await res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({ user: normalizedUser, accessToken });
};

const activate = async (req, res) => {
  const { token } = req.params;
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    throw ApiError.badRequest('Only for not authorized');
  }

  const user = await User.findOne({ where: { activationToken: token } });

  if (!user) {
    throw ApiError.notFound();
  }

  user.activationToken = null;
  user.save();

  const normalizedUser = userService.normalize(user);

  await sendAuthentication(res, normalizedUser);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const { refreshToken } = req.cookies;
  const userData = await jwtService.validateRefreshToken(refreshToken);

  if (userData) {
    throw ApiError.badRequest('Only for not authorized');
  }

  if (!email || !password) {
    throw ApiError.badRequest('Not all the credentials are provided!');
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.notFound();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('The username and/or password is incorrect.');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('The user`s email is not verified!');
  }

  sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || '';
  const token = await tokenService.getByToken(refreshToken);

  if (!refreshToken || !token) {
    res.clearCookie('refreshToken');
    throw ApiError.unauthorized();
  }

  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.badRequest('Token is expired or revoked!');
  }

  await sendAuthentication(res, userData);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.validateRefreshToken(refreshToken);

  if (!refreshToken || !userData) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);
  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const sendResetPassword = async (req, res) => {
  const { email, password } = req.body;
  const { refreshToken } = req.cookies;

  if (!email || !password) {
    throw ApiError.badRequest('Not all credentials are provided!');
  }

  const user = await User.findOne({ where: { email } });

  if (refreshToken) {
    const token = await tokenService.getByToken(refreshToken);

    if (token) {
      throw ApiError.badRequest(
        'Action restricted to unauthorized users only!',
      );
    }
  }

  if (!user) {
    throw ApiError.notFound();
  }

  const resetToken = jwtService.generateAccessToken({ email, password });

  user.activationToken = resetToken;
  user.save();

  emailService.sendResetPasswordEmail(user.email, resetToken);
  res.sendStatus(200);
};

const resetPassword = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { resetToken } = req.params;

  if (refreshToken) {
    const isValidRefreshToken = await tokenService.getByToken(refreshToken);

    if (isValidRefreshToken) {
      throw ApiError.badRequest('Only for not authorized!');
    }
  }

  const user = await User.findOne({ where: { activationToken: resetToken } });
  const userData = await jwtService.validateAccessToken(resetToken);

  if (!user) {
    throw ApiError.notFound();
  }

  if (!userData) {
    throw ApiError.badRequest('Invalid reset token');
  }

  const hashedPassword = await bcrypt.hash(
    userData.password,
    +process.env.HASH_ROUNDS,
  );

  user.activationToken = null;
  user.password = hashedPassword;
  user.save();
  res.send('The password was changed!');
};

const sendResetEmail = async (req, res) => {
  const { password, email } = req.body;

  if (!password || !email) {
    throw ApiError.badRequest('Not all credentials are provided');
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.notFound();
  }

  const resetEmailToken = jwtService.generateAccessToken({ email, password });

  user.activationToken = resetEmailToken;
  user.save();

  emailService.sendResetEmail(user.email, resetEmailToken);
  res.sendStatus(200);
};

const resetEmail = async (req, res) => {
  const { resetToken } = req.params;

  const user = await User.findOne({ where: { activationToken: resetToken } });
  const userData = await jwtService.validateAccessToken(resetToken);

  if (!user) {
    throw ApiError.notFound();
  }

  if (!userData) {
    throw ApiError.badRequest('Invalid reset token');
  }

  emailService.sendResetEmail(user.email, null, true);
  user.activationToken = null;
  user.email = userData.email;
  user.save();
  res.send('The email was changed!');
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetPassword,
  sendResetPassword,
  sendResetEmail,
  resetEmail,
};
