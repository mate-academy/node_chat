import { Message } from '../models/Message.js';

const getAll = async (req, res) => {
  const { chatName } = req.query;

  const messages = await Message.findAll({
    where: { chatName },
    order: [['createdAt', 'DESC']],
  });

  res.send(messages);
};

const getRooms = async (req, res) => {
  const chatRooms = await Message.findAll();

  res.send(chatRooms);
};

const renameChat = async (req, res) => {
  const { chatName, newChatName } = req.body;

  Message.update({ chatName: newChatName }, { where: { chatName } });

  res.sendStatus(201);
};

const removeChat = async (req, res) => {
  const { chatName } = req.body;

  return Message.destroy({ where: { chatName } });
};

export const messagesController = {
  getAll,
  getRooms,
  renameChat,
  removeChat,
};
