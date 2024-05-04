'use strict';

const messageService = require('../services/message.service');
const { ApiError } = require('../exceptions/ApiError');

const getDirectMessages = async (req, res) => {
  const { directId } = req.params;

  if (!directId) {
    throw ApiError.BadRequest('Invalid request');
  }

  const directMessages = await messageService.getAllByDirect(directId);

  res.send(directMessages.map((message) => messageService.normalize(message)));
};

const getRoomMessages = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    throw ApiError.BadRequest('Invalid request');
  }

  const roomMessages = await messageService.getAllByRoom(roomId);

  res.send(roomMessages.map((message) => messageService.normalize(message)));
};

const edit = async (req, res) => {
  const { messageId } = req.params;
  const { newText } = req.body;

  if (!messageId || !newText || typeof newText !== 'string') {
    throw ApiError.BadRequest('Invalid request');
  }

  await messageService.edit({ messageId, newText });

  const updatedMessage = await messageService.getById(messageId);

  res.send(messageService.normalize(updatedMessage));
};

const remove = async (req, res) => {
  const { messageId } = req.params;

  if (!messageId) {
    throw ApiError.BadRequest('Invalid request');
  }

  await messageService.remove(messageId);

  res.sendStatus(204);
};

module.exports = {
  getDirectMessages,
  getRoomMessages,
  edit,
  remove,
};
