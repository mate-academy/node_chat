'use strict';

const directService = require('../services/direct.service');
const messageService = require('../services/message.service');
const { ApiError } = require('../exceptions/ApiError');

const create = async (req, res) => {
  const { userId, anotherUser } = req.body;

  if (typeof anotherUser !== 'string' || typeof userId !== 'string') {
    throw ApiError.BadRequest('Invalid request');
  }

  const direct = await directService.create({ userId, anotherUser });

  res.status(201).send(directService.normalize(direct));
};

const getDirectMessages = async (req, res) => {
  const { directId } = req.params;

  if (!directId) {
    throw ApiError.BadRequest('Invalid request');
  }

  if (!(await directService.getById(directId))) {
    throw ApiError.NotFound('Dialogue does not exist');
  }

  const directMessages = await messageService.getAllByDirect(directId);

  res.send(directMessages.map((message) => messageService.normalize(message)));
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
  getDirectMessages,
  getUserDirects,
};
