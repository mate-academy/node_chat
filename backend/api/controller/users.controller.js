const { UsersServices } = require('../services/users.service');

const getAllUsers = async (req, res) => {
  return res.send(await UsersServices.getAll());
};

const getById = async (req, res) => {
  const { id } = req.params;

  const user = await UsersServices.getById(id);

  res.send(user);
};

const createUser = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.sendStatus(421);
  }

  const newUser = await UsersServices.create(name);

  res.statusCode = 201;
  res.send(newUser);
};

const usersController = {
  createUser,
  getById,
  getAllUsers,
};

module.exports = {
  usersController,
};
