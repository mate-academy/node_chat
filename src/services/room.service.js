const { Room } = require('../models/room.model.js');
const { ApiError } = require('../exceptions/api.error.js');
const { validateName } = require('../utils/validation.js');

const getAllRooms = async () => {
  const rooms = await Room.findAll();

  return rooms;
};

const getRoomById = async (roomId) => {
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw ApiError.notFound({
      message: 'Room not found',
    });
  }

  return room;
};

const createRoom = async ({ userId, name }) => {
  const error = validateName(name);

  if (error) {
    throw ApiError.badRequest({
      message: 'Validate error',
    });
  }

  if (!userId) {
    throw ApiError.badRequest({
      message: 'User is required',
    });
  }

  const room = await Room.create({
    name,
    userId,
  });

  return room;
};

const deleteRoom = async (roomId) => {
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw ApiError.notFound({
      message: 'Not found',
    });
  }

  await room.destroy();
};

const updateRoom = async ({ id, name }) => {
  await Room.update({ name }, { where: { id } });

  const room = await Room.findByPk(id);

  if (!room) {
    throw ApiError.notFound({
      message: 'Nor found',
    });
  }

  return room;
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  deleteRoom,
  updateRoom,
};
