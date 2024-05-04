const { User } = require('../models/user.model.js');
const { ApiError } = require('../exceptions/api.error.js');
const { validateName } = require('../utils/validation.js');

const getUserNameById = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.badRequest({
      message: 'Not found',
    });
  }

  return user.name;
};

const createUser = async (name) => {
  const error = validateName(name);

  if (error) {
    throw ApiError.badRequest({
      message: 'Validate error',
    });
  }

  const user = await User.create({
    name,
  });

  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound({
      message: 'Not found',
    });
  }

  await user.destroy();
};

module.exports = {
  getUserNameById,
  createUser,
  deleteUser,
};
