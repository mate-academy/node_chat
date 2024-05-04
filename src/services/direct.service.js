'use strict';

const { Op } = require('sequelize');
const { Direct } = require('../models/Direct');
const userService = require('./user.service');
const { ApiError } = require('../exceptions/ApiError');

const normalize = ({ id, user1, user2 }) => {
  return { id, user1, user2 };
};

const getById = (id) => {
  return Direct.findByPk(id);
};

const create = async ({ userId, anotherUserId }) => {
  const user1 = await userService.getById(userId);
  const user2 = await userService.getById(anotherUserId);

  if (!user1 || !user2) {
    throw ApiError.NotFound('User not found');
  }

  if (user1.id === user2.id) {
    throw ApiError.BadRequest('Need two users for a dialogue');
  }

  const isExistingDirect = await Direct.findAll({
    where: {
      [Op.and]: [
        { [Op.or]: [{ user1: user2.username }, { user2: user2.username }] },
        { [Op.or]: [{ user1: user1.username }, { user2: user1.username }] },
      ],
    },
  });

  if (isExistingDirect.length) {
    return isExistingDirect[0];
  }

  const newDirect = await Direct.create({
    user1: user1.username,
    user2: user2.username,
  });

  return newDirect;
};

const remove = async (directId) => {
  const direct = await getById(directId);

  if (!direct) {
    throw ApiError.NotFound('Direct does not exist');
  }

  await Direct.destroy({ where: { id: directId } });
};

const getAllByUser = async (userId) => {
  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.NotFound('User does not exist');
  }

  const userDirects = await Direct.findAll({
    where: {
      [Op.or]: [{ user1: user.username }, { user2: user.username }],
    },
  });

  return userDirects;
};

module.exports = {
  normalize,
  getById,
  create,
  remove,
  getAllByUser,
};
