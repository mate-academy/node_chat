const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/user.model');

const register = async (name, password) => {
  const existUser = await findByName(name);

  if (existUser) {
    return;
  }

  const user = await User.create({ id: uuidv4(), name, password });

  return user;
};

const findByName = async (name) => {
  const user = User.findOne({ where: { name } });

  return user;
};

const findById = async (id) => {
  const user = User.findOne({ where: { id } });

  return user;
};

const deleteUser = async (id) => {
  await User.destroy({ where: { id } });
};

const getNameById = async (id) => {
  const user = await User.findOne({ where: { id } });

  return user ? user.name : 'Unknown';
};

const userService = {
  register,
  findByName,
  deleteUser,
  getNameById,
  findById,
};

module.exports = {
  userService,
};
