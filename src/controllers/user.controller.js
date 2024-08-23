const { ApiError } = require('../exceptions/api.error');
const userService = require('../services/user.service');
const { validateName } = require('../utils');

const getOne = async (req, res) => {
  const { id } = req.params;

  const user = await userService.getById(id);

  if (!user) {
    throw ApiError.NotFound();
  }

  res.send(user);
};

const create = async (req, res) => {
  const { name } = req.body;

  const errors = {
    name: validateName(name),
  };

  if (errors.name) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const user = await userService.createOrGetOne(name);

  res.statusCode = 201;
  res.send(user);
};

module.exports = {
  getOne,
  create,
};
