const usersRepository = require('../../entity/users.repository');
const userService = require('../../services/user.service');
const ApiError = require('../../exceptions/api.error');

const findOrCreateUser = async (req, res) => {
  const { name } = req.body;

  const errors = { name: userService.validateName(name) };

  if (errors.name) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const user = await usersRepository.findOrCreate(name);

  res.status(201).json(userService.normalize(user));
};

const userController = { findOrCreateUser };

module.exports = userController;
