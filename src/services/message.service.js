'use strict';

const { Message } = require('../models/Message');
const userService = require('./user.service');
const roomService = require('./room.service');
const directService = require('./direct.service');

const normalize = ({ id, author, text, createdAt }) => {
  return {
    id,
    author,
    text,
    createdAt,
  };
};

const getById = (messageId) => {
  return Message.findOne({ where: { id: messageId } });
};

const getAllByRoom = (roomId) => {
  return Message.findAll({ where: { roomId } });
};

const deleteAllByRoom = (roomId) => {
  return Message.destroy({ where: { roomId } });
};

const getAllByDirect = (directId) => {
  return Message.findAll({ where: { directId } });
};

const add = async ({ text, author, roomId, directId }) => {
  const user = await userService.getByName(author);

  if (!user) {
    throw new Error('User does not exist');
  }

  if (roomId) {
    const room = await roomService.getById(roomId);

    if (!room) {
      throw new Error('Room does not exist');
    }
  } else if (directId) {
    const direct = await directService.getById(directId);

    if (!direct) {
      throw new Error('Direct does not exist');
    }
  }

  return Message.create({
    text,
    author,
    roomId,
    directId,
  });
};

module.exports = {
  normalize,
  getById,
  getAllByRoom,
  getAllByDirect,
  deleteAllByRoom,
  add,
};
