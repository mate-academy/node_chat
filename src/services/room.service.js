/* eslint-disable no-console */
const { ApiError } = require('../exceptions/api.error');
const { User, Room, sequelize } = require('../db/models');
const userService = require('./user.service');

async function getAll() {
  return Room.findAll({ include: User });
}

async function getById(id) {
  return Room.findByPk(id, { include: User });
}

async function create(name, UserId) {
  if (!name.trim()) {
    throw ApiError.BadRequest('Validation error', {
      name: 'Name is empty',
    });
  }

  const user = await userService.getById(UserId);

  if (!user) {
    throw ApiError.NotFound();
  }

  const newRoom = await Room.create({
    name,
    UserId,
  });

  return getById(newRoom.id);
}

async function updateName(id, name) {
  return Room.update({ name }, { where: { id } });
}

async function join(roomId, userId) {
  try {
    const result = await sequelize.transaction(async (t) => {
      const room = await getById(roomId);
      const user = await userService.getById(userId);

      await room.addUser(user);

      return room.id;
    });

    return result;
  } catch (error) {
    console.log(error);
    throw ApiError.NotFound({
      error: 'Room or User does not exist',
    });
  }
}

const remove = async (roomId) => {
  await Room.destroy({
    where: {
      id: roomId,
    },
  });
};

module.exports = {
  getAll,
  getById,
  create,
  updateName,
  join,
  remove,
};
