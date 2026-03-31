import { db } from '../utils/db.js';

const getById = async (id) => {
  return db.message.findUnique({
    where: { id },
  });
};

const create = async (userId, text, roomId) => {
  return db.message.create({
    data: {
      text,
      author: { connect: { id: userId } },
      room: { connect: { id: roomId } },
    },
    include: {
      author: true,
    },
  });
};

export const messagesRepository = {
  getById,
  create,
};
