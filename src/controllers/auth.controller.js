'use strict';

const userService = require('../services/user.service');
const { ApiError } = require('../exceptions/ApiError');

const authorize = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    throw ApiError.BadRequest('Invalid request');
  }

  const user = await userService.authorize(username);

  res.status(201).send(userService.normalize(user));
};

module.exports = {
  authorize,
};
