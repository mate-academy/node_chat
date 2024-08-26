/* eslint-disable no-console */
const { ApiError } = require('../exceptions/api.error');
const { User, Message } = require('../db/models');
const userService = require('./user.service');
const roomService = require('./room.service');

const getAllByRoomId = async (id) => {
  return Message.findAll({
    where: { RoomId: id },
    include: [
      {
        model: User,
        as: 'author', // Alias for the User model
      },
    ],
  });
};

const getById = async (id) => {
  return Message.findByPk(id, {
    include: [
      {
        model: User,
        as: 'author', // Alias for the User model
      },
    ],
  });
};

const create = async (userId, roomId, text) => {
  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.NotFound({
      user: 'User not found',
    });
  }

  const room = await roomService.getById(roomId);

  if (!room) {
    throw ApiError.NotFound({
      room: 'Room not found',
    });
  }

  if (!text.trim()) {
    throw ApiError.BadRequest('Validation error', {
      text: 'Text is empty',
    });
  }

  const newMessega = await Message.create({
    text,
    UserId: userId,
    RoomId: roomId,
  });

  return getById(newMessega.id);
};

module.exports = {
  create,
  getAllByRoomId,
};
