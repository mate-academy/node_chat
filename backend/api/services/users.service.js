const { User } = require('../models/users.model');

const create = async (name) => {
  return User.create({ name });
};

const getById = async (id) => {
  return User.findOne({ where: { id } });
};

const getAll = async () => {
  return User.findAll();
};

const UsersServices = {
  create,
  getById,
  getAll,
};

module.exports = {
  UsersServices,
};
