const { Message } = require('../models/message');

async function findByRoomId(roomId) {
  return Message.findAll({
    where: { roomId },
  });
}

async function createMessage(text, userId, roomId) {
  const user = await Message.create({
    text,
    userId,
    roomId,
  });

  return user;
}

module.exports = {
  findByRoomId,
  createMessage,
};
