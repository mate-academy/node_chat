// const { ApiError } = require('../exeptions/api.error.js');
const { User } = require('../models/user.model.js');

const getUsers = async () => {
  const users = await User.findAll();

  return users;
};

const getUser = async (id) => {
  const user = User.findByPk(id);

  return user;
};

const addUser = async (name) => {
  const newUser = await User.create({
    name,
  });

  return newUser;
};

module.exports = {
  userService: {
    getUsers,
    getUser,
    addUser,
  },
};
