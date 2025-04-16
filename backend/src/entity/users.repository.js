const User = require('../models/User.model');

const getByName = async (name) => {
  return User.findOne({ where: { name } });
};

const getById = async (id) => {
  return User.findByPk(id);
};

const create = async (name) => {
  return User.create({ name });
};

const update = async (id, name) => {
  await User.update({ name }, { where: { id } });

  return getById(id);
};

const remove = async (id) => {
  await User.destroy({ where: { id } });
};

const findOrCreate = async (name) => {
  const user = await getByName(name);

  if (user) {
    return user;
  }

  const newUser = await create(name);

  return newUser;
};

const usersRepository = {
  getByName,
  getById,
  create,
  update,
  remove,
  findOrCreate,
};

module.exports = usersRepository;
