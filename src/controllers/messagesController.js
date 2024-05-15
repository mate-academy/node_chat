import { Message } from '../models/Messages.js';

const remove = async (req, res) => {
  const { chatName } = req.body;

  return Message.destroy({ where: { chatName } });
};

const getRooms = async (req, res) => {
  const chatRooms = await Message.findAll();

  res.send(chatRooms);
};

const getAll = async (req, res) => {
  const { chatName } = req.query;

  const messages = await Message.findAll({
    where: { chatName },
    order: [['createdAt', 'DESC']],
  });

  res.send(messages);
};

const rename = async (req, res) => {
  const { chatName, newChatName } = req.body;

  Message.update({ chatName: newChatName }, { where: { chatName } });

  res.sendStatus(201);
};

export const messagesController = {
  remove,
  getRooms,
  getAll,
  rename,
};
