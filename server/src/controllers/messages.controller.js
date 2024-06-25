const { emitter } = require('../helpers/eventEmiitter');
const { addNewMessage } = require('../models/message.models');

function httpAddNewMessage(req, res) {
  const { text } = req.body;

  const newMessage = addNewMessage(text);

  emitter.emit('message', newMessage);

  res.status(201).json({ data: newMessage });
}

module.exports = { httpAddNewMessage };
