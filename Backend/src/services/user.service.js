const { ApiError } = require('../exceptions/api.error');
const { User } = require('../db/models');

const getById = async (id) => {
  return User.findByPk(id);
};
const getByName = async (name) => {
  return User.findOne({
    where: {
      name,
    },
  });
};

const createOrGetOne = async (name) => {
  if (!name.trim()) {
    throw ApiError.BadRequest('Validation error', {
      name: 'Name is empty',
    });
  }

  const user = await getByName(name);

  if (user) {
    return user;
  }

  return User.create({
    name,
  });
};

module.exports = {
  getById,
  getByName,
  createOrGetOne,
};
