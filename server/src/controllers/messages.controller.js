const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../exeptions/api.error');
const { messageService } = require('../services/messageService');
const { roomServices } = require('../services/room.services');
const { usersServices } = require('../services/users.services');
const { messageEmitter } = require('../emmiters/messages.emmiters');

const getMessagesByRoom = async (req, res) => {
  const { roomId } = req.params;

  const messages = await messageService.getMessagesByRoom(roomId);

  res.status(200).json(messages);
};

const createMessage = async (req, res) => {
  const { text, roomId, userId, userName } = req.body;

  const room = await roomServices.getRoomById(roomId);
  if (!room) {
    throw ApiError.notFound("The room doesn't exist");
  }

  const user = await usersServices.getUsersById(userId);
  if (!user) {
    throw ApiError.notFound("The user doesn't exist");
  }

  const message = await messageService.createMessage(
    text,
    userName,
    userId,
    roomId,
  );

  messageEmitter.emit('message', message);
  res.status(201).json(message);
};

const getMessage = (_, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Connection', 'keep-alive');

  const callback = (message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  };

  messageEmitter.on('message', callback);

  res.on('close', () => {
    messageEmitter.off('message', callback);
  });
};

module.exports = {
  messagesControllers: {
    getMessagesByRoom: asyncHandler(getMessagesByRoom),
    getMessage: asyncHandler(getMessage),
    createMessage: asyncHandler(createMessage),
  },
};
