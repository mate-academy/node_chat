'use strict';

const roomsService = require('../services/rooms.service');
const emitter = require('../emitter');

function getAll(req, res) {
  return res.json(roomsService.getAll());
}

async function create(req, res) {
  const { name } = req.body || {};

  if (!name) {
    res.sendStatus(400);

    return;
  }

  const newRoom = await roomsService.create(name);

  emitter.emit('rooms');
  res.status(201).json(newRoom);
}

async function rename(req, res) {
  const { id } = req.params;
  const { name } = req.body || {};

  if (!name) {
    res.sendStatus(400);

    return;
  }

  const updateRoom = await roomsService.rename(id, name);

  if (updateRoom === null) {
    res.sendStatus(404);

    return;
  }

  emitter.emit('rooms');
  res.json(updateRoom);
}

function remove(req, res) {
  const { id } = req.params;
  const deleteRoom = roomsService.remove(id);

  if (!deleteRoom) {
    res.sendStatus(404);

    return;
  }

  emitter.emit('rooms');
  res.sendStatus(204);
}

module.exports = {
  getAll,
  create,
  rename,
  remove,
};
