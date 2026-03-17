const { User } = require('../models/user.nodel.js');

const getOne = async (id) => {
  return User.findByPk(id);
};

const create = async (name) => {
  return User.create({ name });
};

const update = async (id, name) => {
  const user = await getOne(id);

  return user.update({ name });
};

const remove = async (id) => {
  return User.destroy({ where: { id } });
};

const addRoom = async (id, roomId) => {
  const user = await getOne(id);
  const arr = user.rooms;
  const newArr = [...arr, roomId];

  return user.update({ rooms: newArr });
};

const userService = {
  getOne,
  create,
  update,
  remove,
  addRoom,
};

module.exports = {
  userService,
};
