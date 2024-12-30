const { asyncHandler } = require('../utils/asyncHandler');
const { usersServices } = require('../services/users.services');
const { ApiError } = require('../exeptions/api.error');

const getUsers = async (_, res) => {
  const users = await usersServices.getUsers();

  res.status(200).json(users);
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await usersServices.getUsersById(id);

  res.status(200).json(user);
};

const signIn = async (req, res) => {
  const { name } = req.body;

  const user = await usersServices.getUsersByName(name);

  res.status(200).json(user);
};

const signup = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw ApiError.badRequest('Name is required');
  }

  const isNameExist = await usersServices.getUsersByName(name);

  if (isNameExist) {
    throw ApiError.badRequest('The user is exist');
  }

  const user = await usersServices.createUser(name);

  res.status(201).json(user);
};

module.exports = {
  usersControllers: {
    getUsers: asyncHandler(getUsers),
    getUserById: asyncHandler(getUserById),
    signIn: asyncHandler(signIn),
    signup: asyncHandler(signup),
  },
};
