import { db } from '../utils/db.js';

const getById = async (id) => {
  return db.user.findUnique({
    where: { id },
  });
};

const getByUsername = async (username) => {
  return db.user.findUnique({
    where: { username },
  });
};

const create = async (username) => {
  return db.user.create({
    data: {
      username,
    },
  });
};

const update = async (id, username) => {
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
