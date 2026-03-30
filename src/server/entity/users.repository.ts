import { db } from '../utils/db.js';

const getById = async (id: number) => {
  return db.user.findUnique({
    where: { id },
  });
};

const getByUsername = async (username: string) => {
  return db.user.findUnique({
    where: { username },
  });
};

const create = async (username: string) => {
  return db.user.create({
    data: {
      username,
    },
  });
};

const update = async (id: number, username: string) => {
  return db.user.update({
    where: { id },
    data: {
      username,
    },
  });
};

export const usersRepository = {
  getById,
  getByUsername,
  create,
  update,
};
