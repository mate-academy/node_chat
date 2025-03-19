const { User } = require('../models/user.model.js');

const findUserById = (id) => {
  return User.findOne({ where: { id } });
};

const findUser = (username) => {
  return User.findOne({ where: { username } });
};

const create = (username) => {
  return User.create({ username });
};

module.exports = { userService: { findUser, create, findUserById } };
