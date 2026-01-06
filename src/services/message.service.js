import { Message } from '../model/model.js';

const getAll = () => {
  return Message.findAll();
};

const getById = (messageId) => {
  return Message.findByPk(messageId);
};

const createMessage = (roomId, authorId, text) => {
  return Message.create({
    roomId,
    authorId,
    text,
  });
};

const deleteMessage = (messageId) => {
  return Message.destroy({ where: { id: messageId } });
};

const update = (messageId, text) => {
  return Message.update(
    {
      text,
    },
    {
      where: {
        id: messageId,
      },
    },
  );
};

export const messageService = {
  getAll,
  getById,
  createMessage,
  deleteMessage,
  update,
};
