const { User } = require('../models/user');

const getUsers = async () => {
  const users = await User.findAll();

  return users;
};

const getUsersById = async (id) => {
  const user = await User.findByPk(id);

  return user;
};

const getUsersByName = async (name) => {
  const user = await User.findOne({ where: { name } });

  return user;
};

const createUser = async (name) => {
  const user = await User.create({ name });

  return user;
};

module.exports = {
  usersServices: {
    getUsers,
    getUsersByName,
    createUser,
    getUsersById,
  },
};
