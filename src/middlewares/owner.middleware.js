const { ApiError } = require('../exceptions/api.error');
const { Message } = require('../models/messages.model');
const { Room } = require('../models/rooms.model');

const messageOwnerMiddleware = async (req, res, next) => {
  const { id } = req.params;

  const message = await Message.findByPk(id);

  if (!message) {
    throw ApiError.notFound({ message: 'No Such Message' });
  }

  if (message.userId !== req.user.id) {
    throw ApiError.forbidden();
  }

  next();
};

const roomOwnerMiddleware = async (req, res, next) => {
  const { id } = req.params;

  const room = await Room.findByPk(id);

  if (!room) {
    throw ApiError.notFound({ room: 'No Such Room' });
  }

  if (room.userId !== req.user.id) {
    throw ApiError.forbidden();
  }

  next();
};

const isUserOwnerMiddleware = async (req, res, next) => {
  const { id } = req.params;

  if (id !== req.user.id) {
    throw ApiError.forbidden();
  }

  next();
};

module.exports = {
  messageOwnerMiddleware,
  roomOwnerMiddleware,
  isUserOwnerMiddleware,
};
