const Message = require('../models/message');

async function createMessage({ userId, content, roomId }) {
  const message = await Message.create({
    userId,
    content,
    roomId,
  });

  return message; // Changed from user
}

module.exports = {
  createMessage,
};
