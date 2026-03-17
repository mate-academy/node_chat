const { Room } = require('../models/room.model.js');

const getAll = async () => {
  return Room.findAll();
};

const getOne = async (id) => {
  return Room.findByPk(id);
};

const create = async (name) => {
  return Room.create({ name });
};

const update = async (id, name) => {
  const room = await getOne(id);

  return room.update({ name });
};

const remove = async (id) => {
  return Room.destroy({ where: { id } });
};

const roomService = {
  getAll,
  getOne,
  create,
  update,
  remove,
};

module.exports = {
  roomService,
};
