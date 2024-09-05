const { createMessage, findByRoomId } = require('../services/message.service');

const { EventEmitter } = require('events');
const emitter = new EventEmitter();

const addMessage = async (req, res) => {
  const { text, userId, roomId } = req.body;

  const message = await createMessage(text, userId, roomId);

  emitter.emit('message', message);

  res.status(201).send(message);
};

const getMessages = async (req, res) => {
  const roomId = parseInt(req.params.roomId, 10);

  const messages = await findByRoomId(roomId);

  res.status(200).send(messages);
};

module.exports = {
  addMessage,
  getMessages,
  emitter,
};
