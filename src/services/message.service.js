const { Message } = require('../models/message.model');
const { User } = require('../models/user.model');

const getAllByRoom = async (roomId) => {
  return Message.findAll({
    where: { roomId },
    include: [{ model: User, required: true }],
  });
};

const create = async (message) => {
  return Message.create(message);
};

module.exports = { getAllByRoom, create };
