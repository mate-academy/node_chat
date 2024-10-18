const { Message } = require('../models/Message.model');

const create = async (author, text, roomId) => {
  const message = await Message.create({ author, text, roomId });

  return message;
};

const getByRoomId = async (id) => {
  const roomMessages = await Message.findAll({ where: { roomId: id } });

  return roomMessages;
};

module.exports = { create, getByRoomId };
