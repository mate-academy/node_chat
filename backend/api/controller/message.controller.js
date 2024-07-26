const { messageServices } = require('../services/message.service');
const { roomServices } = require('../services/rooms.service');
const { UsersServices } = require('../services/users.service');

const createMessage = async (req, res) => {
  const { content, senderId, roomId } = req.body;

  if (!content || !senderId || !roomId) {
    return res.sendStatus(421);
  }

  const existingRoom = await roomServices.getById(roomId);
  const existingUser = await UsersServices.getById(senderId);

  if (!existingRoom || !existingUser) {
    return res.sendStatus(404);
  }

  const newMessage = await messageServices.create(content, senderId, roomId);

  res.send(newMessage);
};

const getAllMessage = async (req, res) => {
  return res.send(await messageServices.getAll());
};

const messageController = {
  createMessage,
  getAllMessage,
};

module.exports = {
  messageController,
};
