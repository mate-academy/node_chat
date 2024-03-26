'use strict';

const { Op } = require('sequelize');
const { Chat } = require('../models/Chat');
const { Message } = require('../models/Message');

function normalize({ id, name, creatorName, members }) {
  return {
    id, name, creatorName, members,
  };
}

async function getById(id) {
  const foundChat = await Chat.findByPk(id);

  return foundChat;
}

async function getByUser(userName) {
  const foundMessages = await Chat.findAll({
    where: {
      members: {
        [Op.contains]: [userName],
      },
    },
    order: [['updatedAt', 'DESC']],
    attributes: { exclude: ['updatedAt', 'createdAt'] }, // normalized
  });

  return foundMessages;
}

async function getByName(chatName) {
  const foundChat = await Chat.findOne({
    where: { name: chatName },
  });

  return foundChat;
}

async function create({ name, creatorName, members }) {
  const newChat = await Chat.create({
    name,
    creatorName,
    members,
  });

  return normalize(newChat);
}

async function remove(chat) {
  const chatId = chat.id;

  await Message.destroy({ where: { chatId } });
  await chat.destroy();
}

const chatsService = {
  normalize,
  getById,
  getByUser,
  getByName,
  create,
  remove,
};

module.exports = { chatsService };
