import { Message } from '../models/Message.model';

export const createMessage = async (author, text, id) => {
  const message = await Message.create({ author, text, id });

  return message;
};

export const getAllMessage = async (id) => {
  const messages = await Message.findAll({ where: { id } });

  return messages;
};
