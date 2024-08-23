/* eslint-disable no-console */
const { ApiError } = require('../exceptions/api.error');
const { User, Message } = require('../db/models');
const userService = require('./user.service');
const roomService = require('./room.service');

const getAllByRoomId = async (id) => {
  return Message.findAll({
    where: { RoomId: id },
    include: User,
  });
};

const getById = async (id) => {
  return Message.findByPk(id, {
    include: User,
  });
};

const create = async (UserId, text, RoomId) => {
  const user = await userService.getById(UserId);

  if (!user) {
    throw ApiError.NotFound({
      user: 'User not found',
    });
  }

  const room = await roomService.getById(RoomId);

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
    UserId,
    RoomId,
  });

  return getById(newMessega.id);
};

module.exports = {
  create,
  getAllByRoomId,
};
