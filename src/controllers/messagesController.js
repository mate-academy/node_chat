'use strict';

const { typeSocket } = require('../config');
const { ErrorApi } = require('../exceptions/ErrorApi');
const { chatsService } = require('../services/chatsService');
const { messagesService } = require('../services/messagesService');
const { socketEmitter } = require('./socketController');

async function get(req, res) {
  const { chatId } = req.params;

  if (!chatId) {
    throw ErrorApi.BadRequest('Incorrect chatId for getting messages');
  }

  const foundMessages = await messagesService.getAllByChat(chatId);

  if (!foundMessages) {
    throw ErrorApi.NotFound('messages');
  }

  res.status(200).send(foundMessages);
}

async function create(req, res) {
  const { chatId } = req.params;
  const { text, userName } = req.body;

  if (!chatId || !text || !userName) {
    throw ErrorApi.BadRequest('Incorrect data for creating messages');
  }

  const foundChat = await chatsService.getById(chatId);

  if (!foundChat) {
    throw ErrorApi.NotFound('chat');
  }

  const recipients = foundChat.members;
  const newMessage = await messagesService.create({
    text,
    creatorName: userName,
    chatId,
  });

  socketEmitter.emit(typeSocket.message, {
    newMessage, recipients, chatId,
  });

  res.sendStatus(201);
}

const messagesController = {
  get,
  create,
};

module.exports = { messagesController };
