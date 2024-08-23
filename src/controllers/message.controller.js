const { ApiError } = require('../exceptions/api.error');
const messageService = require('../services/message.service');
const { EventEmitter } = require('events');
const { validateText } = require('../utils');

const emitter = new EventEmitter();

const getAll = async (req, res) => {
  const { id } = req.params;

  res.send(await messageService.getAllByRoomId(id));
};

const create = async (req, res) => {
  const { UserId, text, RoomId } = req.body;

  const errors = {
    text: validateText(text),
  };

  if (errors.text) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const message = await messageService.create(UserId, text, RoomId);

  emitter.emit('message', message);
  res.statusCode = 201;
  res.send(message);
};

module.exports = {
  emitter,
  getAll,
  create,
};
