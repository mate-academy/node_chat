const { ApiError } = require('../exceptions/apiError');
const { Room } = require('../models/Room');

function create(name) {
  if (!name) {
    throw ApiError.badRequest('Name is required');
  }

  return Room.create({ name });
}

function join(id) {
  return Room.findByPk({ id });
}

async function remove(id) {
  if (!id) {
    throw ApiError.badRequest('Id is required');
  }

  const existRoom = await join(id);

  if (!existRoom) {
    throw ApiError.notFound();
  }

  return Room.destroy({ where: { id } });
}

async function rename(id, newName) {
  if (!id) {
    throw ApiError.badRequest('Id is required');
  }

  if (!newName) {
    throw ApiError.badRequest('Name is required');
  }

  const room = await join(id);

  if (!room) {
    throw ApiError.notFound();
  }

  room.name = newName;
  room.save();

  return room;
}

module.exports = {
  create,
  join,
  remove,
  rename,
};
