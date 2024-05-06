/* eslint-disable no-console */
const userService = require('../services/user.service.js');
// const jwtService = require('../services/jwt.service.js');
// const { ApiError } = require('../exceptions/api.error.js');
// const validator = require('../utils/validation.js');
// const bcrypt = require('bcrypt');
// const emailService = require('../services/email.service.js');

const login = async (req, res) => {
  const { name } = req.body;

  const newUser = await userService.createUser(name);

  res.send(newUser);
};

const logout = async (req, res) => {
  const { user } = req.body;

  await userService.deleteUser(user.id);

  res.sendStatus(204);
};

module.exports = {
  login,
  logout,
};
