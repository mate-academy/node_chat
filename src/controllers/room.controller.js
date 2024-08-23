const { ApiError } = require('../exceptions/api.error');
const roomService = require('../services/room.service');
const { validateName } = require('../utils');

const getAll = async (req, res) => {
  res.send(await roomService.getAll());
};

const getOne = async (req, res) => {
  const { id } = req.params;

  const room = await roomService.getById(id);

  if (!room) {
    throw ApiError.NotFound();
  }
  res.send(room);
};

const create = async (req, res) => {
  const { name, UserId } = req.body;

  const errors = {
    name: validateName(name),
  };

  if (errors.name) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const room = await roomService.create(name, UserId);

  res.statusCode = 201;
  res.send(room);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const errors = {
    name: validateName(name),
  };

  if (errors.name) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await roomService.updateName(id, name);
  res.sendStatus(200);
};

const remove = async (req, res) => {
  const { id } = req.params;

  await roomService.remove(id);
  res.sendStatus(204);
};

const join = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  const room = await roomService.join(id, userId);

  res.statusCode = 201;
  res.send(room);
};

module.exports = {
  getAll,
  getOne,
  create,
  update,
  join,
  remove,
};
