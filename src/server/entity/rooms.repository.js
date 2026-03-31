import { db } from '../utils/db.js';

const getById = async (id) => {
  return db.room.findUnique({
    where: { id },
    include: {
      users: true,
      messages: {
        include: {
          author: true,
        },
      },
    },
  });
};

const getAllByUserId = async (userId) => {
  return db.room.findMany({
    where: {
      users: {
        some: { id: userId },
      },
    },
    include: {
      users: true,
    },
  });
};

const create = async (name, userId) => {
  return db.room.create({
    data: {
      name,
      users: { connect: { id: userId } },
    },
    include: {
      users: true,
      messages: {
        include: {
          author: true,
        },
      },
    },
  });
};

const addUser = async (id, userId) => {
  return db.room.update({
    where: { id },
    data: {
      users: {
        connect: { id: userId },
      },
    },
    include: {
      users: true,
      messages: {
        include: {
          author: true,
        },
      },
    },
  });
};

const removeUser = async (id, userId) => {
  return db.room.update({
    where: { id },
    data: {
      users: {
        disconnect: { id: userId },
      },
    },
    include: {
      users: true,
    },
  });
};

const renamed = async (id, name) => {
  return db.room.update({
    where: { id },
    data: {
      name,
    },
    include: {
      users: true,
      messages: {
        include: {
          author: true,
        },
      },
    },
  });
};

const deleteOne = async (id) => {
  return db.room.delete({
    where: { id },
  });
};

export const roomsRepository = {
  getById,
  getAllByUserId,
  create,
  addUser,
  deleteOne,
  renamed,
  removeUser,
};
