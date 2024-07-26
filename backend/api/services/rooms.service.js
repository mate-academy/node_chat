const { Room } = require('../models/room.model');

const getAllRooms = async () => {
  return Room.findAll();
};

const getById = async (id) => {
  return Room.findOne({ where: { id } });
};

const create = async (name, createByUserId) => {
  return Room.create({ name, createByUserId });
};

const update = async (id, name) => {
  return Room.update({ name }, { where: { id } });
};

const connect = async () => {};

const remove = async (id) => {
  return Room.destroy({ where: { id } });
};

const roomServices = {
  getAllRooms,
  getById,
  create,
  update,
  connect,
  remove,
};

module.exports = {
  roomServices,
};
