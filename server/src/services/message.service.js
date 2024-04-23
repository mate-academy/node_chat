/* eslint-disable no-console */

const { Op } = require('sequelize');
const Message = require('../models/message');

const createMessage = async (message) => {
  return (await Message.create(message)).dataValues;
};

const getMessages = async (chatId) => {
  return Message.findAll({ where: { chatId } });
};

const changeReadStatus = async (chatId, userId) => {
  const result = await Message.update(
    { read: true },
    {
      where: {
        chatId,
        userId,
      },
      individualHooks: true,
    },
  );

  return result;
};

const getUnread = async (userId, chats) => {
  return Message.findAll({
    where: {
      userId: {
        [Op.not]: userId,
      },
      chatId: {
        [Op.in]: chats,
      },
      read: false,
    },
  });
};

const readAll = async (userId, chats) => {
  const result = await Message.update(
    { read: true },
    {
      where: {
        userId: {
          [Op.not]: userId,
        },
        chatId: {
          [Op.in]: chats,
        },
      },
      individualHooks: true,
    },
  );

  console.log(result);
};

const prepare = (message) => {
  message.date = new Date().toString();

  return message;
};

module.exports = {
  createMessage,
  prepare,
  getMessages,
  changeReadStatus,
  getUnread,
  readAll,
};
