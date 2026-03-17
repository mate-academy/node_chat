const { Message } = require('../models/message.model.js');

const getAll = async () => {
  return Message.findAll();
};

const getOne = async (id) => {
  return Message.findByPk(id);
};

const create = async (authorId, text, time, roomId) => {
  return Message.create({
    authorId,
    text,
    time,
    roomId,
  });
};

const update = async (id, authorId, text, time, roomId) => {
  const message = await getOne(id);

  return message.update({
    authorId,
    text,
    time,
    roomId,
  });
};

const remove = async (id) => {
  return Message.destroy({ where: { id } });
};

const messageService = {
  getAll,
  getOne,
  create,
  update,
  remove,
};

module.exports = {
  messageService,
};
