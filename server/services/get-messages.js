const { Message } = require('../models/messages');
require('dotenv').config();

async function getMessages(room) {
  return await Message.findAll({
    where: {
      room: room,
    },
    limit: 100,
    order: [['__createdtime__', 'ASC']],
  })
}

module.exports = getMessages;
