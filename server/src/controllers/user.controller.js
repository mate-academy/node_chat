require('dotenv/config');

const bcrypt = require('bcrypt');

const ApiError = require('../exceptions/apiError.js');
const userService = require('../services/user.service.js');
const jwtService = require('../services/jwt.service.js');
const validate = require('../services/validate.service.js');

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  validate.registrationData({ name, email, password });

  let user = await userService.getByEmail(email);

  if (user) {
    throw ApiError.BadRequest('User with given email already exist');
  }

  user = await userService.createUser({ name, email, password });

  generateTokens(res, user);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  validate.loginData({ email, password });

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.Validation('Invalid email or password...');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw ApiError.Validation('Invalid email or password...');
  }

  generateTokens(res, userService.normalize(user));
};

const findUser = async (req, res) => {
  const userId = req.params.userId;
  const user = await userService.getById(userId);

  res.send(user);
};

const getUsers = async (req, res) => {
  const users = await userService.getAll();

  res.send(users);
};

const generateTokens = (res, user) => {
  const { refreshToken, accessToken } = jwtService.generateTokens();

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  res.send({ user, accessToken });
};

module.exports = {
  registerUser,
  loginUser,
  findUser,
  getUsers,
};
