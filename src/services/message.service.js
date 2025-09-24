import { Message } from '../models/Message.js';

const getAll = async () => {
  const result = await Message.findAll();
  return result;
};

const getByRoom = async (roomId) => {
  const result = await Message.findAll({ where: { roomId } });
  return result;
};

const add = async (message) => {
  try {
    const newMessage = await Message.create(message);
    return newMessage;
  } catch (error) {
    throw new Error('Failed to add message: ' + error.message);
  }
};

const deleteByRoom = async (roomId) => {
  const deletedCount = await Message.destroy({
    where: { roomId },
  });
  return deletedCount > 0;
};

export const messageService = {
  getAll,
  getByRoom,
  add,
  deleteByRoom,
};
