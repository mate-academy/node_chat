const { Message } = require('../models/messages');
require('dotenv').config();

async function saveMessage(message, username, room, __createdtime__, socketId) {
  try {
    const createdMessage = await Message.create({
      message,
      username,
      room,
      socketId,
      __createdtime__,
      __updatedtime__: new Date(),
    });
    return createdMessage;
  } catch (error) {
    throw error;
  }
}

module.exports = saveMessage;
