/* eslint-disable no-console */
const { User } = require('../models/user.model.js');
const { ApiError } = require('../exceptions/api.error.js');

class UserService {
  getUserNameById = async (userId) => {
    const user = await User.findByPk(userId);

    if (!user) {
      throw ApiError.badRequest({
        message: 'Not found',
      });
    }

    return user.name;
  };

  createUser = async (name) => {
    if (!name) {
      throw ApiError.badRequest({
        message: 'Validate error',
      });
    }

    const user = await User.create({
      name,
    });

    return user;
  };

  deleteUser = async (userId) => {
    const user = await User.findByPk(userId);

    if (!user) {
      throw ApiError.notFound({
        message: 'Not found',
      });
    }

    await user.destroy();
  };
}

const userService = new UserService();

module.exports = { userService };
