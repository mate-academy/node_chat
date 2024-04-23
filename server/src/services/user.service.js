const bcrypt = require('bcrypt');
const User = require('../models/user.js');

const getByEmail = async (email) => {
  return User.findOne({ where: { email } }) || null;
};

const getById = async (id) => {
  const user = (await User.findByPk(id)) || null;

  if (!user) {
    return null;
  }

  return normalize(user);
};

const getAll = async () => {
  const users = await User.findAll();
  const normalizedUsers = users.map((user) => normalize(user.dataValues));

  return normalizedUsers;
};

const createUser = async (newUser) => {
  const user = await User.create(newUser);
  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  return normalize(user);
};

const normalize = ({ name, email, id }) => {
  return { name, email, id };
};

module.exports = {
  getByEmail,
  getById,
  createUser,
  normalize,
  getAll,
};
