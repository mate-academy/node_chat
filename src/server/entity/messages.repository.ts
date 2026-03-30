import { db } from '../utils/db.js';

const getById = async (id: number) => {
  return db.message.findUnique({
    where: { id },
  });
};

const create = async (userId: number, text: string, roomId: string) => {
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
