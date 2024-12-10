const { User } = require('../models/user.model');

const create = async (user) => {
  return User.create(user);
};

const getAll = async () => {
  return User.findAll();
};

const get = async (id) => {
  return User.findByPk(id);
};

const getByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const normalize = ({ id, name }) => {
  return { id, name };
};

const destroy = async (id) => {
  return User.destroy({ where: { id } });
};

const update = async (newUser) => {
  return User.update({ ...newUser }, { where: { id: newUser.id } });
};

module.exports = {
  create,
  get,
  update,
  destroy,
  getByEmail,
  normalize,
  getAll,
};
