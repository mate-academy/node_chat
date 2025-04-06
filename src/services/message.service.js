const Message = require('../models/message');

async function createMessage({ userId, content, roomId }) {
  const message = await Message.create({
    userId,
    content,
    roomId,
  });

  return message;
}

async function findByRoomId(roomId) {
  const messages = await Message.findAll({
    where: { roomId },
  });

  return messages;
}

module.exports = {
  createMessage,
  findByRoomId,
};
