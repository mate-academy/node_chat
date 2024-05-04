'use strict';

const { Message } = require('../models/Message');
const userService = require('./user.service');
const roomService = require('./room.service');
const directService = require('./direct.service');
const { ApiError } = require('../exceptions/ApiError');

const normalize = ({ id, author, text, createdAt }) => {
  return {
    id,
    author,
    text,
    createdAt,
  };
};

const getById = (messageId) => {
  return Message.findByPk(messageId);
};

const getAllByRoom = async (roomId) => {
  if (!(await roomService.getById(roomId))) {
    throw ApiError.NotFound('Room does not exist');
  }

  return Message.findAll({ where: { roomId }, order: [['createdAt', 'ASC']] });
};

const deleteAllByRoom = async (roomId) => {
  if (!(await roomService.getById(roomId))) {
    throw ApiError.NotFound('Room does not exist');
  }

  return Message.destroy({ where: { roomId } });
};

const deleteAllByDirect = async (directId) => {
  if (!(await directService.getById(directId))) {
    throw ApiError.NotFound('Direct does not exist');
  }

  return Message.destroy({ where: { directId } });
};

const getAllByDirect = async (directId) => {
  if (!(await directService.getById(directId))) {
    throw ApiError.NotFound('Dialogue does not exist');
  }

  return Message.findAll({
    where: { directId },
    order: [['createdAt', 'ASC']],
  });
};

const add = async ({ text, author, roomId, directId }) => {
  const user = await userService.getByName(author);

  if (!user) {
    throw new ApiError.NotFound('User does not exist');
  }

  if (roomId) {
    const room = await roomService.getById(roomId);

    if (!room) {
      throw new ApiError.NotFound('Room does not exist');
    }
  } else if (directId) {
    const direct = await directService.getById(directId);

    if (!direct) {
      throw new ApiError.NotFound('Direct does not exist');
    }
  }

  return Message.create({
    text,
    author,
    roomId,
    directId,
  });
};

const edit = async ({ messageId, newText }) => {
  const message = await getById(messageId);

  if (!message) {
    throw new ApiError.NotFound('Message not found');
  }

  message.text = newText;
  await message.save();
};

const remove = async (messageId) => {
  const message = await getById(messageId);

  if (!message) {
    throw new ApiError.NotFound('Message not found');
  }

  await Message.destroy({ where: { id: messageId } });
};

module.exports = {
  normalize,
  getById,
  getAllByRoom,
  getAllByDirect,
  deleteAllByRoom,
  deleteAllByDirect,
  add,
  edit,
  remove,
};
