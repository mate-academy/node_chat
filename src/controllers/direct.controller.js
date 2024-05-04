'use strict';

const directService = require('../services/direct.service');
const messageService = require('../services/message.service');
const { ApiError } = require('../exceptions/ApiError');

const create = async (req, res) => {
  const { userId, anotherUserId } = req.body;

  if (typeof anotherUserId !== 'string' || typeof userId !== 'string') {
    throw ApiError.BadRequest('Invalid request');
  }

  const direct = await directService.create({ userId, anotherUserId });

  res.status(201).send(directService.normalize(direct));
};

const remove = async (req, res) => {
  const { directId } = req.params;

  if (!directId) {
    throw ApiError.BadRequest('Invalid request');
  }

  await messageService.deleteAllByDirect(directId);
  await directService.remove(directId);

  res.sendStatus(204);
};

const getUserDirects = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw ApiError.BadRequest('Invalid request');
  }

  const userDirects = await directService.getAllByUser(userId);

  res.send(userDirects.map((direct) => directService.normalize(direct)));
};

module.exports = {
  create,
  remove,
  getUserDirects,
};
