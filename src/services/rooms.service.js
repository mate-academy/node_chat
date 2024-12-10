const { Room } = require('../models/room.model');

const create = async (room) => {
  return Room.create(room);
};

const getAll = async () => {
  return Room.findAll();
};

const update = async (room) => {
  return Room.update({ ...room }, { where: { id: room.id } });
};

const remove = async (id) => {
  return Room.destroy({ where: { id } });
};

module.exports = {
  create,
  getAll,
  update,
  remove,
};
