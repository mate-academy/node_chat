'use strict';

const { typeSocket } = require('../config');
const { ErrorApi } = require('../exceptions/ErrorApi');
const { getRemoves } = require('../exceptions/getRemoves');
const { chatsService } = require('../services/chatsService');
const { socketEmitter } = require('./socketController');

async function create(req, res) {
  const { name, userName, members } = req.body;

  if (!name || !userName || !members) {
    throw ErrorApi.BadRequest('Incorrect data for creating chat');
  }

  const foundChat = await chatsService.getByName(name);

  if (foundChat) {
    throw ErrorApi.Conflict();
  }

  const createParams = {
    name,
    creatorName: userName,
    members,
  };

  const newChat = await chatsService.create(createParams);

  socketEmitter.emit(typeSocket.chatCreate, newChat);

  res.sendStatus(201);
}

async function update(req, res) {
  const { chatId } = req.params;
  const { name, members } = req.body;

  if (!name || !members || !chatId) {
    throw ErrorApi.BadRequest('Incorrect data for creating chat');
  }

  const foundChat = await chatsService.getById(chatId);

  if (!foundChat) {
    throw ErrorApi.NotFound('chat');
  }

  const removesMembers = getRemoves(foundChat.members, members);

  foundChat.name = name;
  foundChat.members = members;

  const updatedChat = await foundChat.save();

  socketEmitter.emit(typeSocket.chatEdit, chatsService.normalize(updatedChat));

  if (removesMembers.length > 0) {
    socketEmitter.emit(typeSocket.chatDelete, {
      chatId, recipients: removesMembers,
    });
  }

  res.sendStatus(200);
}

async function leave(req, res) {
  const { chatId } = req.params;
  const { name } = req.body;

  if (!name || !chatId) {
    throw ErrorApi.BadRequest('Incorrect data for leaving chat');
  }

  const foundChat = await chatsService.getById(chatId);

  if (!foundChat) {
    throw ErrorApi.NotFound('chat');
  }

  if (foundChat.members.length === 1) {
    await chatsService.remove(foundChat);
  } else {
    const oldCreater = foundChat.creatorName;
    const newMembers = foundChat.members.filter(m => m !== name);

    if (oldCreater === name) {
      foundChat.creatorName = newMembers[0];
    }

    foundChat.members = newMembers;

    await foundChat.save();

    socketEmitter.emit(typeSocket.chatEdit, foundChat);
  }

  socketEmitter.emit(typeSocket.chatDelete, {
    chatId, recipients: [name],
  });

  res.sendStatus(200);
}

async function remove(req, res) {
  const { chatId } = req.params;

  if (!chatId) {
    throw ErrorApi.BadRequest('Incorrect data for removing chat');
  }

  const foundChat = await chatsService.getById(chatId);

  if (!foundChat) {
    throw ErrorApi.NotFound('chat');
  }

  const recipients = foundChat.members;

  await chatsService.remove(foundChat);

  socketEmitter.emit(typeSocket.chatDelete, {
    chatId, recipients,
  });

  res.sendStatus(200);
}

const chatsController = {
  create,
  update,
  leave,
  remove,
};

module.exports = { chatsController };
