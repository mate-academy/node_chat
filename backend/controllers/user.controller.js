const ApiError = require('../exeptions/api.error');
const { createUser, getUser, removeUser } = require('../services/user.services');
const normalizeUser = require('../utils/normalizeUser');

async function getOneUser(req, res) {
  const { userId } = req.params;
  const user = await getUser(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json(user);
}

async function registerUser(req, res) {
  const { userName } = req.body;

  const user = await createUser(userName.trim());

  res.json(normalizeUser(user));
}

async function deleteUser(req, res) {
  const { userId } = req.params;
  const user = await getUser(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const result = await removeUser(userId);

  if (!result) {
    throw ApiError.notFound('User not found');
  }

  res.json(result);
}

module.exports = {
  userController: {
    registerUser,
    deleteUser,
    getOneUser
  }
}
