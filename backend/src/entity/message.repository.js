const Message = require('../models/Message.model');
const User = require('../models/User.model');

const getAll = async ({ userId }) => {
  const where = {};

  if (userId) {
    where.authorId = userId;
  }

  return Message.findAll({
    where,
    include: { model: User, attributes: ['id', 'name'] },
    order: [['createdAt', 'DESC']],
  });
};

const getById = async (id) => {
  return Message.findByPk(id, {
    include: { model: User, attributes: ['id', 'name'] },
  });
};

const create = async ({ text, userId }) => {
  const message = await Message.create({ text, authorId: userId });

  return getById(message.id);
};

const deleteById = async (id) => {
  await Message.destroy({ where: { id } });
};

const updateById = async (id, { text }) => {
  await Message.update({ text }, { where: { id } });

  return getById(id);
};

const messagesRepository = { getAll, create, getById, deleteById, updateById };

module.exports = messagesRepository;
