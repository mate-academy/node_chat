const { ApiError } = require('../exception/api.error.js');
const { userService } = require('../services/user.service.js');

const getOne = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest('Id is required');
  }

  const user = await userService.findUserById(id);

  if (!user) {
    throw ApiError.notFound({
      user: 'Not found',
    });
  }

  res.send(user);
};

const create = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    throw ApiError.badRequest('username is required');
  }

  const isExist = await userService.findUser(username);

  if (isExist) {
    throw ApiError.badRequest('Username is already taken');
  }

  const newUser = await userService.create(username);

  res.send(newUser);
};

module.exports = { userController: { create, getOne } };
