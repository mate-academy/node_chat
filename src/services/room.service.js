const { ApiError } = require('../exceptions/api.error');
const { Room } = require('../models/Room.model');

const create = async (name) => {
  if (!name) {
    throw ApiError.badRequest('name is required');
  }

  const newRoom = await Room.create({ name });

  return newRoom;
};

const remove = async (id) => {
  if (!id) {
    throw ApiError.badRequest('id is required');
  }

  await Room.destroy({ where: { id } });
};

const rename = async (id, newName) => {
  if (!id) {
    throw ApiError.badRequest('id is required');
  }

  if (!newName) {
    throw ApiError.badRequest('new name required');
  }

  const renamedRoom = await Room.findOne({ where: { id } });

  if (!renamedRoom) {
    throw ApiError.notFound();
  }

  renamedRoom.name = newName;
  renamedRoom.save();

  return renamedRoom;
};

module.exports = {
  create,
  remove,
  rename,
};
