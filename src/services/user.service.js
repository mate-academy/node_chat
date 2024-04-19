'use strict';

const { User } = require('../models/User');

const normalize = ({ id, username }) => {
  return { id, username };
};

const getByName = (username) => {
  return User.findOne({ where: { username } });
};

const getById = (userId) => {
  return User.findOne({ where: { id: userId } });
};

const authorize = async (username) => {
  const existingUser = await getByName(username);

  if (existingUser) {
    return existingUser;
  }

  return User.create({ username });
};

module.exports = {
  normalize,
  getById,
  getByName,
  authorize,
};
