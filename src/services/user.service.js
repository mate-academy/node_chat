const { User } = require('../models/User');

const normalize = ({ id, name }) => {
  return { id, name };
};

const createUser = (name) => {
  return User.create({ name });
};

module.exports = {
  normalize,
  createUser,
};
