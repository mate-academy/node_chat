const { Room } = require('../models/room.model');
const roomsService = require('../services/rooms.service');
const { ApiError } = require('../utils/api.error');

const getAll = async (req, res) => {
  const rooms = await roomsService.getAll();

  res.send(rooms);
};

const create = async (req, res) => {
  const { name, userId } = req.body;

  if (!name || !userId) {
    throw ApiError.badRequest('Not all data is provided!');
  }

  const possibleRoom = await Room.findOne({ where: { name } });

  if (possibleRoom) {
    throw ApiError.badRequest('This room already exists');
  }

  const newRoom = await roomsService.create({ name, userId });

  res.send(newRoom);
};

const remove = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw ApiError.notFound();
  }

  if (id === '1') {
    throw ApiError.forbidden();
  }

  const possibleRoom = await Room.findOne({ where: { id } });

  if (!possibleRoom) {
    throw ApiError.notFound();
  }

  await roomsService.remove(id);
  res.sendStatus(204);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!id || !name) {
    throw ApiError.badRequest('Not all data is provided!');
  }

  const possibleRoom = await Room.findOne({ where: { id } });

  if (!possibleRoom) {
    throw ApiError.notFound();
  }

  await roomsService.update({ id, name });
  res.sendStatus(204);
};

module.exports = {
  getAll,
  create,
  remove,
  update,
};
