'use strict';

import { Message } from '../models/messageModel.js';

const getAll = async ({ room }) => {
  const result = await Message.findAll({
    where: {
      ...(room && { room }),
    },
    
  })
  return result;
};


// const getAll = async () => {
//   const result = await Message.findAll();

//   return result;
// };
// const getAll = async (room) => {
//   const result = await Message.findAll({
//     where: { room },
//   });
//   return result;
// };

// In your service (messageService.js or wherever you have this):
// const getAll = async (room) => {
//   const result = await Message.findAll({
//     where: { room },
//   });
//   return result;
// };




const getById = async (id) => {
  return Message.findByPk(id);
};


const create = async ({ text, author, room }) => {
  return Message.create({
    text,
    author,
    room,
  });
};

const update = async ({ id, text }) => {
  return Message.update({ text }, { where: { id } },
  );
};

const remove = async (id) => {
  return Message.destroy({ where: { id } });
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};
