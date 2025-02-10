const { EventEmitter } = require('events');
const messageService = require('../services/message.service');

const messageEmitter = new EventEmitter();

const create = async (req, res) => {
  const { roomId } = req.params;
  const { text, userId } = req.body;

  if (!roomId || !userId || !text) {
    res.sendStatus(404);

    return;
  }

  const newMessage = await messageService.createMessage(text, userId, roomId);

  messageEmitter.emit('message', newMessage);

  res.status(201).json(newMessage);
};

const getMessages = async (req, res) => {
  const { roomId } = req.params;
  const messages = await messageService.getMessagesInRoom(roomId);

  res.status(200).json(messages);
};

module.exports = {
  create,
  getMessages,
  messageEmitter,
};
