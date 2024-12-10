const { ApiError } = require('../utils/api.error');
const messagesService = require('../services/message.service');
const { EventEmitter } = require('ws');
const messageEmitter = new EventEmitter();

const getMessage = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Connection', 'keep-alive');

  const callback = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  messageEmitter.on('message', callback);
  req.on('close', () => messageEmitter.off('message', callback));
};

const getAllMessages = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    throw ApiError.badRequest('The id for the room is not provided!');
  }

  const messages = await messagesService.getAllByRoom(roomId);

  if (!messages) {
    throw ApiError.notFound();
  }

  const normalized = messages.map((message) => {
    const { name, id } = message.dataValues.user;

    return { ...message.dataValues, user: { name, id } };
  });

  res.send(normalized);
};

const create = async (req, res) => {
  const { name, user, roomId } = req.body;

  if (!name || !user || !roomId) {
    throw ApiError.badRequest('Not all data is provided!');
  }

  const createdMessage = await messagesService.create({
    name,
    roomId,
    userId: user.id,
  });

  messageEmitter.emit('message', {
    ...createdMessage,
    user,
  });
  res.send(createdMessage);
};

module.exports = {
  getMessage,
  getAllMessages,
  create,
  messageEmitter,
};
