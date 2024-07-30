const { Message } = require('../models/Message.model');
const { eventEmitter  } = require('../utils/sockets');

const getRoomMessages = async (req, res) => {
  const { id } = req.params;
  const messages = await Message.findAll({ where: { chat_id: id } });

  res.send(messages);
};

const createRoomMessage = async (req, res) => {
  const { author, time, text, chat_id } = req.body;
  const newMessage = {
    author,
    time,
    text,
    chat_id,
  };
  const createdMessage = await Message.create(newMessage);
  eventEmitter.emit('messageAdd', createdMessage);
  res.send(createdMessage);
};

module.exports = {
  messagesController: {
    getRoomMessages,
    createRoomMessage,
  },
};
